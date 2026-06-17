import type Parser from "web-tree-sitter";
import { getParser } from "../treesitter";
import type { Graph, GraphNode, GraphEdge, SourceFile } from "../types";

type Node = Parser.SyntaxNode;

// Cap parsing of a single file so a pathological input can't block the event loop.
const MAX_PARSE_MICROS = 5_000_000; // 5s

export type LangSpec = {
  language: string;
  wasm: string;
  funcDefQuery: string;
  callQuery: string;
  /** Captures the raw module specifier of each import (e.g. `./utils`, `pkg.mod`). */
  importQuery: string;
  funcDefTypes: ReadonlySet<string>;
  /** Captures class definitions (e.g. `(class_definition) @class`). Omit for class-less languages. */
  classQuery?: string;
  /** Node types that introduce a class scope (to attribute methods to a class). */
  classNodeTypes?: ReadonlySet<string>;
  /** Base-class names a class declaration extends. */
  classBases?: (node: Node) => string[];
  /** Map an import specifier (from `fromFile`) to a file path in the project, or null. */
  resolveModule: (
    fromFile: string,
    specifier: string,
    paths: Set<string>,
  ) => string | null;
};

const moduleId = (file: string) => `mod::${file}`;
const funcId = (file: string, name: string) => `${file}::${name}`;
const classId = (file: string, name: string) => `class::${file}::${name}`;

function resolveName(node: Node): string | null {
  const direct = node.childForFieldName("name");
  if (direct) return direct.text;
  // JS: `const foo = () => {}` keeps the name on the variable_declarator.
  const parent = node.parent;
  if (parent && parent.type === "variable_declarator") {
    const name = parent.childForFieldName("name");
    if (name) return name.text;
  }
  return null;
}

/** Nearest enclosing defined-function name, or null when at module top level. */
function enclosingFunctionName(
  node: Node,
  funcDefTypes: ReadonlySet<string>,
): string | null {
  let current: Node | null = node.parent;
  while (current) {
    if (funcDefTypes.has(current.type)) {
      const name = resolveName(current);
      if (name) return name;
    }
    current = current.parent;
  }
  return null;
}

/** Nearest enclosing class name, or null when the node is not inside a class. */
function enclosingClassName(
  node: Node,
  classNodeTypes: ReadonlySet<string>,
): string | null {
  let current: Node | null = node.parent;
  while (current) {
    if (classNodeTypes.has(current.type)) {
      const name = resolveName(current);
      if (name) return name;
    }
    current = current.parent;
  }
  return null;
}

function stripQuotes(text: string): string {
  return text.replace(/^['"`]|['"`]$/g, "");
}

type FileFacts = {
  file: string;
  defs: Set<string>;
  // function name -> owning class, or null when the name is owned by more than
  // one class in the file (ambiguous: don't attribute it to the wrong class).
  methodClass: Map<string, string | null>;
  classes: Set<string>;
  extendsRel: { cls: string; base: string }[];
  calls: { caller: string | null; callee: string }[];
  imports: Set<string>;
};

// Queries compiled once per analyzeProjectWith run and reused across files. They
// hold WASM allocations, so the caller must delete() them (and the parser) after.
type CompiledQueries = {
  defQuery: Parser.Query;
  callQuery: Parser.Query;
  importQuery: Parser.Query;
  classQuery: Parser.Query | null;
};

function parseFile(
  spec: LangSpec,
  parser: Parser,
  queries: CompiledQueries,
  source: SourceFile,
  paths: Set<string>,
): FileFacts {
  const tree = parser.parse(source.content);
  // parse() returns null when the timeout is hit; skip the file instead of crashing.
  if (!tree) {
    return {
      file: source.path,
      defs: new Set<string>(),
      methodClass: new Map<string, string | null>(),
      classes: new Set<string>(),
      extendsRel: [],
      calls: [],
      imports: new Set<string>(),
    };
  }
  const root = tree.rootNode;

  const classNodeTypes = spec.classNodeTypes ?? new Set<string>();
  const defs = new Set<string>();
  const methodClass = new Map<string, string | null>();
  for (const { node } of queries.defQuery.captures(root)) {
    const name = resolveName(node);
    if (!name) continue;
    defs.add(name);
    const cls = enclosingClassName(node, classNodeTypes);
    // Same name in different contexts (two classes, or module-level vs class)
    // -> ambiguous, mark null so we don't attribute it to the wrong class.
    if (methodClass.has(name)) {
      if (methodClass.get(name) !== cls) methodClass.set(name, null);
    } else {
      methodClass.set(name, cls);
    }
  }

  const classes = new Set<string>();
  const extendsRel: { cls: string; base: string }[] = [];
  if (queries.classQuery) {
    for (const { node } of queries.classQuery.captures(root)) {
      const name = resolveName(node);
      if (!name) continue;
      classes.add(name);
      const bases = spec.classBases?.(node) ?? [];
      for (const base of bases) extendsRel.push({ cls: name, base });
    }
  }

  const calls: { caller: string | null; callee: string }[] = [];
  for (const { node } of queries.callQuery.captures(root)) {
    calls.push({
      caller: enclosingFunctionName(node, spec.funcDefTypes),
      callee: node.text,
    });
  }

  const imports = new Set<string>();
  for (const { node } of queries.importQuery.captures(root)) {
    const target = spec.resolveModule(
      source.path,
      stripQuotes(node.text),
      paths,
    );
    if (target && target !== source.path) imports.add(target);
  }

  tree.delete();
  return {
    file: source.path,
    defs,
    methodClass,
    classes,
    extendsRel,
    calls,
    imports,
  };
}

/** Pick the defining file for a name, preferring local, then imported, then unique. */
function resolveOwner(
  name: string,
  fromFile: string,
  imports: Set<string>,
  index: Map<string, string[]>,
): string | undefined {
  const candidates = index.get(name);
  if (!candidates || candidates.length === 0) return undefined;
  if (candidates.includes(fromFile)) return fromFile;
  const imported = candidates.filter((c) => imports.has(c));
  if (imported.length > 0) return imported[0];
  if (candidates.length === 1) return candidates[0];
  return undefined; // ambiguous
}

export async function analyzeProjectWith(
  spec: LangSpec,
  files: SourceFile[],
): Promise<Graph> {
  const paths = new Set(files.map((f) => f.path));

  // One parser + one set of compiled queries per run, reused across files and
  // freed afterwards. parse() and the query loops are synchronous, so a single
  // parser is safe; this replaces the per-file new Parser()/query() that leaked
  // WASM memory (Parser/Query handles were never delete()d).
  const { parser, language } = await getParser(spec.wasm);
  parser.setTimeoutMicros(MAX_PARSE_MICROS);
  const queries: CompiledQueries = {
    defQuery: language.query(spec.funcDefQuery),
    callQuery: language.query(spec.callQuery),
    importQuery: language.query(spec.importQuery),
    classQuery: spec.classQuery ? language.query(spec.classQuery) : null,
  };

  let facts: FileFacts[];
  try {
    facts = files.map((f) => parseFile(spec, parser, queries, f, paths));
  } finally {
    queries.defQuery.delete();
    queries.callQuery.delete();
    queries.importQuery.delete();
    queries.classQuery?.delete();
    parser.delete();
  }

  // Global symbol tables.
  const defToFiles = new Map<string, string[]>();
  const classToFiles = new Map<string, string[]>();
  for (const f of facts) {
    for (const name of f.defs) {
      const list = defToFiles.get(name) ?? [];
      list.push(f.file);
      defToFiles.set(name, list);
    }
    for (const name of f.classes) {
      const list = classToFiles.get(name) ?? [];
      list.push(f.file);
      classToFiles.set(name, list);
    }
  }

  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();
  const addEdge = (source: string, target: string, kind: GraphEdge["kind"]) => {
    const key = `${kind} ${source} ${target}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target, kind });
  };

  const usedModules = new Set<string>();

  // Import edges (module -> module).
  for (const f of facts) {
    for (const target of f.imports) {
      addEdge(moduleId(f.file), moduleId(target), "imports");
      usedModules.add(f.file);
      usedModules.add(target);
    }
  }

  // Call edges, resolved across files using imports to disambiguate.
  for (const f of facts) {
    for (const { caller, callee } of f.calls) {
      const targetFile = resolveOwner(callee, f.file, f.imports, defToFiles);
      if (!targetFile) continue;
      const source = caller ? funcId(f.file, caller) : moduleId(f.file);
      addEdge(source, funcId(targetFile, callee), "calls");
      usedModules.add(f.file);
      usedModules.add(targetFile);
    }
  }

  // Inheritance edges (class -> base class).
  for (const f of facts) {
    for (const { cls, base } of f.extendsRel) {
      const targetFile = resolveOwner(base, f.file, f.imports, classToFiles);
      if (!targetFile) continue;
      addEdge(classId(f.file, cls), classId(targetFile, base), "extends");
      usedModules.add(f.file);
      usedModules.add(targetFile);
    }
  }

  for (const f of facts) {
    if (f.defs.size > 0 || f.classes.size > 0) usedModules.add(f.file);
  }

  // Nodes: modules, then classes (parent = module), then functions/methods.
  const nodes: GraphNode[] = [];
  for (const file of usedModules) {
    nodes.push({ id: moduleId(file), label: file, type: "module", file });
  }
  for (const f of facts) {
    for (const name of f.classes) {
      nodes.push({
        id: classId(f.file, name),
        label: name,
        type: "class",
        file: f.file,
        parent: moduleId(f.file),
      });
    }
  }
  for (const f of facts) {
    for (const name of f.defs) {
      const owningClass = f.methodClass.get(name);
      nodes.push({
        id: funcId(f.file, name),
        label: name,
        type: "function",
        file: f.file,
        parent: owningClass ? classId(f.file, owningClass) : moduleId(f.file),
      });
    }
  }

  return { nodes, edges };
}
