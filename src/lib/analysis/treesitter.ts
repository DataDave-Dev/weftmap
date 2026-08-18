import Parser from "web-tree-sitter";
import { readFile } from "node:fs/promises";
import path from "node:path";

const WASM_DIR = path.join(process.cwd(), "public", "wasm");

let initPromise: Promise<void> | null = null;
const languageCache = new Map<string, Parser.Language>();

function initRuntime(): Promise<void> {
  // locateFile points the tree-sitter.wasm runtime load at public/wasm.
  if (!initPromise) {
    initPromise = Parser.init({
      locateFile: (name: string) => path.join(WASM_DIR, name),
    }).catch((error: unknown) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

async function loadLanguage(wasmFile: string): Promise<Parser.Language> {
  const cached = languageCache.get(wasmFile);
  if (cached) return cached;
  const bytes = await readFile(path.join(WASM_DIR, wasmFile));
  const language = await Parser.Language.load(bytes);
  languageCache.set(wasmFile, language);
  return language;
}

export async function getParser(
  wasmFile: string,
): Promise<{ parser: Parser; language: Parser.Language }> {
  await initRuntime();
  const language = await loadLanguage(wasmFile);
  const parser = new Parser();
  parser.setLanguage(language);
  return { parser, language };
}
