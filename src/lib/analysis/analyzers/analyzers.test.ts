import { describe, expect, test } from "vitest";
import { pythonAnalyzer } from "./python";
import { javascriptAnalyzer } from "./javascript";
import type { Graph, LanguageAnalyzer, SourceFile } from "../types";

function run(analyzer: LanguageAnalyzer, files: [string, string][]): Promise<Graph> {
  const sources: SourceFile[] = files.map(([path, content]) => ({ path, content }));
  return analyzer.analyzeProject(sources);
}

function hasEdge(
  graph: Graph,
  source: string,
  target: string,
  kind: Graph["edges"][number]["kind"],
): boolean {
  return graph.edges.some(
    (e) => e.source === source && e.target === target && e.kind === kind,
  );
}

function hasNode(graph: Graph, id: string): boolean {
  return graph.nodes.some((n) => n.id === id);
}

describe("pythonAnalyzer", () => {
  test("call graph dentro de un archivo", async () => {
    const graph = await run(pythonAnalyzer, [
      [
        "a.py",
        `def main():
    helper()

def helper():
    leaf()

def leaf():
    pass

main()
`,
      ],
    ]);

    expect(hasNode(graph, "a.py::main")).toBe(true);
    expect(hasEdge(graph, "a.py::main", "a.py::helper", "calls")).toBe(true);
    expect(hasEdge(graph, "a.py::helper", "a.py::leaf", "calls")).toBe(true);
    // Module-level call sources from the module node.
    expect(hasEdge(graph, "mod::a.py", "a.py::main", "calls")).toBe(true);
  });

  test("ignora llamadas a builtins", async () => {
    const graph = await run(pythonAnalyzer, [["a.py", "def f():\n    print(len([]))\n"]]);
    expect(hasNode(graph, "a.py::f")).toBe(true);
    expect(graph.edges).toEqual([]);
  });

  test("resuelve llamadas e imports entre archivos", async () => {
    const graph = await run(pythonAnalyzer, [
      ["main.py", "from helpers import work\n\ndef run():\n    work()\n"],
      ["helpers.py", "def work():\n    pass\n"],
    ]);

    expect(hasEdge(graph, "mod::main.py", "mod::helpers.py", "imports")).toBe(true);
    expect(hasEdge(graph, "main.py::run", "helpers.py::work", "calls")).toBe(true);
  });
});

describe("javascriptAnalyzer", () => {
  test("funciones declaradas y arrow asignadas", async () => {
    const graph = await run(javascriptAnalyzer, [
      [
        "a.js",
        `function main() {
  helper();
}
const helper = () => {
  leaf();
};
function leaf() {}
main();
`,
      ],
    ]);

    expect(hasEdge(graph, "a.js::main", "a.js::helper", "calls")).toBe(true);
    expect(hasEdge(graph, "a.js::helper", "a.js::leaf", "calls")).toBe(true);
  });

  test("resuelve import relativo entre archivos", async () => {
    const graph = await run(javascriptAnalyzer, [
      ["main.js", 'import { work } from "./helpers";\nfunction run() { work(); }\n'],
      ["helpers.js", "export function work() {}\n"],
    ]);

    expect(hasEdge(graph, "mod::main.js", "mod::helpers.js", "imports")).toBe(true);
    expect(hasEdge(graph, "main.js::run", "helpers.js::work", "calls")).toBe(true);
  });
});
