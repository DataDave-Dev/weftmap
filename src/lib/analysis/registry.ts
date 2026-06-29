import type { LanguageAnalyzer } from "./types";
import { pythonAnalyzer } from "./analyzers/python";
import { javascriptAnalyzer } from "./analyzers/javascript";
import { typescriptAnalyzer } from "./analyzers/typescript";
import { goAnalyzer } from "./analyzers/go";
import { rustAnalyzer } from "./analyzers/rust";
import { sqlAnalyzer } from "./analyzers/sql";
import { javaAnalyzer } from "./analyzers/java";

const analyzers: LanguageAnalyzer[] = [
  pythonAnalyzer,
  javascriptAnalyzer,
  typescriptAnalyzer,
  goAnalyzer,
  rustAnalyzer,
  sqlAnalyzer,
  javaAnalyzer,
];

const registry = new Map(analyzers.map((a) => [a.language, a]));

export const SUPPORTED_LANGUAGES = [...registry.keys()];

export function getAnalyzer(language: string): LanguageAnalyzer | undefined {
  return registry.get(language);
}
