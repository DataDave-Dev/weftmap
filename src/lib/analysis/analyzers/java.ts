import type { LanguageAnalyzer } from "../types";
import { analyzeProjectWith, type LangSpec } from "./shared";
import type Parser from "web-tree-sitter";

function classBases(node: Parser.SyntaxNode): string[] {
  const superclass = node.namedChildren.find((c) => c.type === "superclass");
  if (!superclass) return [];
  const typeNode = superclass.namedChildren[0];
  if (typeNode) {
    if (typeNode.type === "generic_type") {
      const baseNode = typeNode.childForFieldName("type");
      if (baseNode) return [baseNode.text];
    }
    return [typeNode.text];
  }
  return [];
}

function resolveModule(
  fromFile: string,
  specifier: string,
  paths: Set<string>,
): string | null {
  if (specifier.endsWith(".*")) {
    return null;
  }
  const relPath = specifier.replace(/\./g, "/") + ".java";
  for (const p of paths) {
    if (p.endsWith(relPath)) {
      return p;
    }
  }
  return null;
}

const spec: LangSpec = {
  language: "java",
  wasm: "tree-sitter-java.wasm",
  funcDefQuery: `
    (method_declaration) @def
    (constructor_declaration) @def
  `,
  callQuery: `
    (method_invocation name: (identifier) @callee)
  `,
  importQuery: `
    (import_declaration (scoped_identifier) @mod)
    (import_declaration (identifier) @mod)
  `,
  classQuery: `
    (class_declaration) @class
    (interface_declaration) @class
  `,
  funcDefTypes: new Set(["method_declaration", "constructor_declaration"]),
  classNodeTypes: new Set(["class_declaration", "interface_declaration"]),
  classBases,
  resolveModule,
};

export const javaAnalyzer: LanguageAnalyzer = {
  language: spec.language,
  analyzeProject: (files) => analyzeProjectWith(spec, files),
};
