import path from "node:path";
import type { LanguageAnalyzer } from "../types";
import { analyzeProjectWith, type LangSpec } from "./shared";

// `from pkg.mod import x`, `from .mod import x`, `import pkg.mod`, `import pkg.mod as m`.
function resolveModule(
  fromFile: string,
  specifier: string,
  paths: Set<string>,
): string | null {
  const dots = specifier.match(/^\.+/);
  let baseNoExt: string;
  if (dots) {
    const up = dots[0].length;
    const rest = specifier.slice(up).split(".").filter(Boolean);
    let dir = path.posix.dirname(fromFile);
    for (let i = 1; i < up; i++) dir = path.posix.dirname(dir);
    baseNoExt = rest.length ? path.posix.join(dir, ...rest) : dir;
  } else {
    baseNoExt = specifier.split(".").join("/");
  }

  const candidates = [`${baseNoExt}.py`, path.posix.join(baseNoExt, "__init__.py")];
  for (const c of candidates) if (paths.has(c)) return c;
  for (const c of candidates) {
    for (const p of paths) if (p === c || p.endsWith("/" + c)) return p;
  }
  // Last resort: any file whose basename matches the leaf module.
  if (!dots) {
    const leaf = `${specifier.split(".").pop()}.py`;
    for (const p of paths) if (p === leaf || p.endsWith("/" + leaf)) return p;
  }
  return null;
}

const spec: LangSpec = {
  language: "python",
  wasm: "tree-sitter-python.wasm",
  funcDefQuery: "(function_definition) @def",
  callQuery: `
    (call function: (identifier) @callee)
    (call function: (attribute attribute: (identifier) @callee))
  `,
  importQuery: `
    (import_from_statement module_name: (dotted_name) @mod)
    (import_from_statement module_name: (relative_import) @mod)
    (import_statement name: (dotted_name) @mod)
    (import_statement name: (aliased_import name: (dotted_name) @mod))
  `,
  funcDefTypes: new Set(["function_definition"]),
  resolveModule,
};

export const pythonAnalyzer: LanguageAnalyzer = {
  language: spec.language,
  analyzeProject: (files) => analyzeProjectWith(spec, files),
};
