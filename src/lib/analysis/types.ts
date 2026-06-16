export type NodeKind = "module" | "function" | "class";

export type GraphNode = {
  id: string;
  label: string;
  type: NodeKind;
  /** Source file this node belongs to (undefined for synthetic roots). */
  file?: string;
  /** Id of the containing module node, for grouping in the diagram. */
  parent?: string;
};

export type EdgeKind = "calls" | "imports" | "extends";

export type GraphEdge = {
  source: string;
  target: string;
  kind: EdgeKind;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

/** One source file in a project analysis request. */
export type SourceFile = {
  path: string;
  content: string;
};

export interface LanguageAnalyzer {
  language: string;
  analyzeProject(files: SourceFile[]): Promise<Graph>;
}
