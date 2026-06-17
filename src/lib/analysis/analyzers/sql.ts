import type Parser from "web-tree-sitter";
import { getParser } from "../treesitter";
import type {
  Cardinality,
  Graph,
  GraphEdge,
  GraphNode,
  LanguageAnalyzer,
  SourceFile,
  TableColumn,
} from "../types";

type Node = Parser.SyntaxNode;

// Cap parsing of a single file so a pathological input can't block the event loop.
const MAX_PARSE_MICROS = 5_000_000; // 5s

const WASM = "tree-sitter-sql.wasm";
const tableId = (key: string) => `table::${key}`;
// SQL identifiers are case-insensitive and may be double-quoted; normalize for matching.
const norm = (raw: string) => raw.replace(/^"(.*)"$/, "$1").toLowerCase();

type Fk = {
  fromTable: string; // normalized key
  fromCols: string[];
  toTable: string;
};

type Table = {
  key: string;
  label: string;
  columns: Map<string, TableColumn>;
  pk: Set<string>;
};

/** Table name from an `object_reference` (the `name` field, sans quotes). */
function refName(node: Node | null): string | null {
  return node?.childForFieldName("name")?.text ?? null;
}

function childOfType(node: Node, type: string): Node | null {
  for (let i = 0; i < node.namedChildCount; i++) {
    const c = node.namedChild(i)!;
    if (c.type === type) return c;
  }
  return null;
}

function hasChildType(node: Node, type: string): boolean {
  for (let i = 0; i < node.childCount; i++) {
    if (node.child(i)!.type === type) return true;
  }
  return false;
}

/** Column names inside an `ordered_columns` node. */
function orderedColumns(node: Node | null): string[] {
  if (!node) return [];
  const cols: string[] = [];
  for (let i = 0; i < node.namedChildCount; i++) {
    const col = node.namedChild(i)!;
    if (col.type !== "column") continue;
    const name = col.childForFieldName("name");
    if (name) cols.push(norm(name.text));
  }
  return cols;
}

function normalizeType(typeNode: Node | null): string {
  if (!typeNode) return "";
  return typeNode.text.replace(/\s+/g, " ").trim().toLowerCase();
}

// Parse state. Constraints (table-level / ALTER / CREATE INDEX) are deferred into
// `pk`/`unique` keyed by table name and applied after every file is parsed, so
// cross-file FKs and constraints resolve regardless of statement/file order.
type Ctx = {
  tables: Map<string, Table>;
  fks: Fk[];
  pk: Map<string, Set<string>>;
  unique: Map<string, Set<string>>;
};

function addCols(map: Map<string, Set<string>>, key: string, cols: string[]): void {
  let set = map.get(key);
  if (!set) map.set(key, (set = new Set()));
  for (const c of cols) set.add(c);
}

/** Parse a table-level or ALTER `constraint` (PK / FK / UNIQUE), deferred by table name. */
function readConstraint(node: Node, tableKey: string, ctx: Ctx): void {
  const cols = orderedColumns(childOfType(node, "ordered_columns"));
  if (hasChildType(node, "keyword_foreign")) {
    const toTable = refName(childOfType(node, "object_reference"));
    if (toTable) ctx.fks.push({ fromTable: tableKey, fromCols: cols, toTable: norm(toTable) });
  } else if (hasChildType(node, "keyword_primary")) {
    addCols(ctx.pk, tableKey, cols);
  } else if (hasChildType(node, "keyword_unique")) {
    addCols(ctx.unique, tableKey, cols);
  }
}

function readColumn(node: Node, table: Table, ctx: Ctx): void {
  const nameNode = node.childForFieldName("name");
  if (!nameNode) return;
  const name = norm(nameNode.text);
  const pk = hasChildType(node, "keyword_primary");
  const notNull = hasChildType(node, "keyword_not") && hasChildType(node, "keyword_null");
  const unique = hasChildType(node, "keyword_unique");
  const isFk = hasChildType(node, "keyword_references");

  const col: TableColumn = {
    name: nameNode.text.replace(/^"(.*)"$/, "$1"),
    type: normalizeType(node.childForFieldName("type")),
    pk,
    fk: isFk,
    nullable: !notNull && !pk,
    unique,
  };
  table.columns.set(name, col);
  if (pk) table.pk.add(name);

  if (isFk) {
    const toTable = refName(childOfType(node, "object_reference"));
    if (toTable) ctx.fks.push({ fromTable: table.key, fromCols: [name], toTable: norm(toTable) });
  }
}

function readCreateTable(node: Node, ctx: Ctx): void {
  const rawName = refName(childOfType(node, "object_reference"));
  if (!rawName) return;
  const key = norm(rawName);
  const table: Table =
    ctx.tables.get(key) ??
    { key, label: rawName.replace(/^"(.*)"$/, "$1"), columns: new Map(), pk: new Set() };
  ctx.tables.set(key, table);

  const defs = childOfType(node, "column_definitions");
  if (!defs) return;
  for (let i = 0; i < defs.namedChildCount; i++) {
    const child = defs.namedChild(i)!;
    if (child.type === "column_definition") readColumn(child, table, ctx);
    else if (child.type === "constraints") {
      for (let j = 0; j < child.namedChildCount; j++) {
        const con = child.namedChild(j)!;
        if (con.type === "constraint") readConstraint(con, key, ctx);
      }
    } else if (child.type === "constraint") {
      readConstraint(child, key, ctx);
    }
  }
}

function readAlterTable(node: Node, ctx: Ctx): void {
  const rawName = refName(childOfType(node, "object_reference"));
  if (!rawName) return;
  const add = childOfType(node, "add_constraint");
  if (!add) return;
  const con = childOfType(add, "constraint");
  if (con) readConstraint(con, norm(rawName), ctx);
}

/** Defer UNIQUE single-column indexes onto their columns. */
function readCreateIndex(node: Node, ctx: Ctx): void {
  if (!hasChildType(node, "keyword_unique")) return;
  const rawName = refName(childOfType(node, "object_reference"));
  if (!rawName) return;
  const fields = childOfType(node, "index_fields");
  if (!fields) return;
  const cols: string[] = [];
  for (let i = 0; i < fields.namedChildCount; i++) {
    const col = fields.namedChild(i)!.childForFieldName("column");
    if (col) cols.push(norm(col.text));
  }
  if (cols.length === 1) addCols(ctx.unique, norm(rawName), cols);
}

function walk(root: Node, ctx: Ctx): void {
  const visit = (n: Node) => {
    switch (n.type) {
      case "create_table":
        readCreateTable(n, ctx);
        return;
      case "alter_table":
        readAlterTable(n, ctx);
        return;
      case "create_index":
        readCreateIndex(n, ctx);
        return;
    }
    for (let i = 0; i < n.namedChildCount; i++) visit(n.namedChild(i)!);
  };
  visit(root);
}

function cardinalityFor(fk: Fk, from: Table): Cardinality {
  // FK side is "one" when the referencing columns are unique or the full PK.
  const allUnique = fk.fromCols.every((c) => from.columns.get(c)?.unique);
  const isFullPk =
    from.pk.size > 0 &&
    from.pk.size === fk.fromCols.length &&
    fk.fromCols.every((c) => from.pk.has(c));
  return allUnique || isFullPk ? "1:1" : "1:N";
}

/** A junction/bridge table: composite PK made of exactly two FK columns. */
function isJunction(table: Table, fks: Fk[]): Fk[] | null {
  const own = fks.filter((f) => f.fromTable === table.key);
  if (own.length !== 2) return null;
  const fkCols = new Set(own.flatMap((f) => f.fromCols));
  if (table.pk.size < 2) return null;
  const pkAllFk = [...table.pk].every((c) => fkCols.has(c));
  return pkAllFk ? own : null;
}

async function analyzeProject(files: SourceFile[]): Promise<Graph> {
  const { parser } = await getParser(WASM);
  parser.setTimeoutMicros(MAX_PARSE_MICROS);

  const ctx: Ctx = { tables: new Map(), fks: [], pk: new Map(), unique: new Map() };
  const { tables, fks } = ctx;

  for (const file of files) {
    let tree: Parser.Tree | null = null;
    try {
      tree = parser.parse(file.content);
      if (tree) walk(tree.rootNode, ctx);
    } finally {
      tree?.delete();
    }
  }

  // Apply deferred PK / UNIQUE constraints now that all tables exist.
  for (const [key, cols] of ctx.pk) {
    const t = tables.get(key);
    if (!t) continue;
    for (const c of cols) {
      t.pk.add(c);
      const col = t.columns.get(c);
      if (col) {
        col.pk = true;
        col.nullable = false;
      }
    }
  }
  for (const [key, cols] of ctx.unique) {
    const t = tables.get(key);
    if (!t) continue;
    for (const c of cols) {
      const col = t.columns.get(c);
      if (col) col.unique = true;
    }
  }

  // Flag FK columns (covers FKs declared via table-level/ALTER constraints).
  for (const fk of fks) {
    const t = tables.get(fk.fromTable);
    if (!t) continue;
    for (const c of fk.fromCols) {
      const col = t.columns.get(c);
      if (col) col.fk = true;
    }
  }

  const nodes: GraphNode[] = [...tables.values()].map((t) => ({
    id: tableId(t.key),
    label: t.label,
    type: "table",
    columns: [...t.columns.values()],
  }));

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const pushEdge = (e: GraphEdge) => {
    const id = `${e.source}->${e.target}:${e.kind}:${e.column ?? ""}`;
    if (seen.has(id)) return;
    seen.add(id);
    edges.push(e);
  };

  for (const fk of fks) {
    const from = tables.get(fk.fromTable);
    if (!from || !tables.has(fk.toTable)) continue; // skip edges to unknown tables
    pushEdge({
      source: tableId(fk.fromTable),
      target: tableId(fk.toTable),
      kind: "references",
      column: fk.fromCols.join(", "),
      cardinality: cardinalityFor(fk, from),
    });
  }

  // N:M relationships inferred from junction tables.
  for (const t of tables.values()) {
    const pair = isJunction(t, fks);
    if (!pair) continue;
    const [a, b] = pair;
    if (!tables.has(a.toTable) || !tables.has(b.toTable)) continue;
    pushEdge({
      source: tableId(a.toTable),
      target: tableId(b.toTable),
      kind: "references",
      column: t.label,
      cardinality: "N:M",
    });
  }

  return { nodes, edges };
}

export const sqlAnalyzer: LanguageAnalyzer = {
  language: "sql",
  analyzeProject,
};
