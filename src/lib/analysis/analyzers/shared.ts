import type Parser from "web-tree-sitter";
import { getParser } from "../treesitter";
import type { Graph, GraphNode, GraphEdge, SourceFile } from "../types";

type Node = Parser.SyntaxNode;

export type LangSpec = {
  language: string;
  wasm: string;
  funcDefQuery: string;
  callQuery: string;
  /** Captures the raw module specifier of each import (e.g. `./utils`, `pkg.mod`). */
  importQuery: string;
  funcDefTypes: ReadonlySet<string>;
  /** Map an import specifier (from `fromFile`) to a file path in the project, or null. */
  resolveModule: (fromFile: string, specifier: string, paths: Set<string>) => string | null;
};

const moduleId = (file: string) => `mod::${file}`;
const funcId = (file: string, name: string) => `${file}::${name}`;

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

function stripQuotes(text: string): string {
  return text.replace(/^['"`]|['"`]$/g, "");
}

type FileFacts = {
  file: string;
  defs: Set<string>;
  calls: { caller: string | null; callee: string }[];
  imports: Set<string>; // resolved target file paths
};

async function parseFile(
  spec: LangSpec,
  source: SourceFile,
  paths: Set<string>,
): Promise<FileFacts> {
  const { parser, language } = await getParser(spec.wasm);
  const tree = parser.parse(source.content);
  const root = tree.rootNode;

  const defs = new Set<string>();
  const defQuery = language.query(spec.funcDefQuery);
  for (const { node } of defQuery.captures(root)) {
    const name = resolveName(node);
    if (name) defs.add(name);
  }

  const calls: { caller: string | null; callee: string }[] = [];
  const callQuery = language.query(spec.callQuery);
  for (const { node } of callQuery.captures(root)) {
    calls.push({
      caller: enclosingFunctionName(node, spec.funcDefTypes),
      callee: node.text,
    });
  }

  const imports = new Set<string>();
  const importQuery = language.query(spec.importQuery);
  for (const { node } of importQuery.captures(root)) {
    const target = spec.resolveModule(source.path, stripQuotes(node.text), paths);
    if (target && target !== source.path) imports.add(target);
  }

  tree.delete();
  return { file: source.path, defs, calls, imports };
}

export async function analyzeProjectWith(
  spec: LangSpec,
  files: SourceFile[],
): Promise<Graph> {
  const paths = new Set(files.map((f) => f.path));
  const facts = await Promise.all(files.map((f) => parseFile(spec, f, paths)));

  // Global symbol table: which files define each function name.
  const defToFiles = new Map<string, string[]>();
  for (const f of facts) {
    for (const name of f.defs) {
      const list = defToFiles.get(name) ?? [];
      list.push(f.file);
      defToFiles.set(name, list);
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
      const candidates = defToFiles.get(callee);
      if (!candidates || candidates.length === 0) continue;

      let targetFile: string | undefined;
      if (candidates.includes(f.file)) {
        targetFile = f.file; // local definition wins
      } else {
        const imported = candidates.filter((c) => f.imports.has(c));
        if (imported.length > 0) targetFile = imported[0];
        else if (candidates.length === 1) targetFile = candidates[0];
      }
      if (!targetFile) continue; // ambiguous: skip rather than guess

      const source = caller ? funcId(f.file, caller) : moduleId(f.file);
      addEdge(source, funcId(targetFile, callee), "calls");
      usedModules.add(f.file);
      usedModules.add(targetFile);
    }
  }

  // Nodes: a module per file that has functions or participates in edges,
  // plus a function node per defined function.
  for (const f of facts) {
    if (f.defs.size > 0) usedModules.add(f.file);
  }

  const nodes: GraphNode[] = [];
  for (const file of usedModules) {
    nodes.push({ id: moduleId(file), label: file, type: "module", file });
  }
  for (const f of facts) {
    for (const name of f.defs) {
      nodes.push({
        id: funcId(f.file, name),
        label: name,
        type: "function",
        file: f.file,
        parent: moduleId(f.file),
      });
    }
  }

  return { nodes, edges };
}
