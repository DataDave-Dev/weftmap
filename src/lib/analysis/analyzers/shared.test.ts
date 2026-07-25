import type Parser from "web-tree-sitter";
import { expect, test, vi } from "vitest";
import { getParser } from "../treesitter";
import { analyzeProjectWith, type LangSpec } from "./shared";

vi.mock("../treesitter", () => ({
  getParser: vi.fn(),
}));

test("deletes a parsed tree when extraction throws", async () => {
  const extractionError = new Error("capture failed");
  const deleteTree = vi.fn();
  const tree = {
    rootNode: {},
    delete: deleteTree,
  } as unknown as Parser.Tree;

  const defQuery = {
    captures: vi.fn(() => {
      throw extractionError;
    }),
    delete: vi.fn(),
  } as unknown as Parser.Query;
  const callQuery = {
    captures: vi.fn(() => []),
    delete: vi.fn(),
  } as unknown as Parser.Query;
  const importQuery = {
    captures: vi.fn(() => []),
    delete: vi.fn(),
  } as unknown as Parser.Query;

  const parser = {
    setTimeoutMicros: vi.fn(),
    parse: vi.fn(() => tree),
    delete: vi.fn(),
  } as unknown as Parser;
  const language = {
    query: vi
      .fn()
      .mockReturnValueOnce(defQuery)
      .mockReturnValueOnce(callQuery)
      .mockReturnValueOnce(importQuery),
  } as unknown as Parser.Language;
  vi.mocked(getParser).mockResolvedValue({ parser, language });

  const spec: LangSpec = {
    language: "test",
    wasm: "test.wasm",
    funcDefQuery: "(function) @def",
    callQuery: "(call) @callee",
    importQuery: "(import) @mod",
    funcDefTypes: new Set(["function"]),
    resolveModule: () => null,
  };

  await expect(
    analyzeProjectWith(spec, [{ path: "input.test", content: "source" }]),
  ).rejects.toBe(extractionError);
  expect(deleteTree).toHaveBeenCalledOnce();
});
