import type { LanguageAnalyzer } from "../types";
import { analyzeProjectWith, type LangSpec } from "./shared";

// Rust modules are commonly organized with Cargo paths and `mod` declarations.
// Keep import/module resolution conservative for now and rely on the analyzer's
// unique-definition fallback for cross-file calls in small pasted projects.
const spec: LangSpec = {
  language: "rust",
  wasm: "tree-sitter-rust.wasm",
  funcDefQuery: "(function_item) @def",
  callQuery: `
    (call_expression function: (identifier) @callee)
    (call_expression function: (field_expression field: (field_identifier) @callee))
    (call_expression function: (scoped_identifier name: (identifier) @callee))
  `,
  importQuery: "(use_declaration) @mod",
  funcDefTypes: new Set(["function_item"]),
  resolveModule: () => null,
};

export const rustAnalyzer: LanguageAnalyzer = {
  language: spec.language,
  analyzeProject: (files) => analyzeProjectWith(spec, files),
};
