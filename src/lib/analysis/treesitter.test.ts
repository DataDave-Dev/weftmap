import { expect, test, vi } from "vitest";
import { getParser } from "./treesitter";

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  loadLanguage: vi.fn(),
  readFile: vi.fn(),
  setLanguage: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  readFile: mocks.readFile,
}));

vi.mock("web-tree-sitter", () => {
  class MockParser {
    static init = mocks.init;
    static Language = { load: mocks.loadLanguage };

    setLanguage = mocks.setLanguage;
  }

  return { default: MockParser };
});

test("retries runtime initialization after a transient failure", async () => {
  const transientError = new Error("runtime temporarily unavailable");
  const language = {};
  mocks.init
    .mockRejectedValueOnce(transientError)
    .mockResolvedValueOnce(undefined);
  mocks.readFile.mockResolvedValue(new Uint8Array());
  mocks.loadLanguage.mockResolvedValue(language);

  await expect(getParser("test.wasm")).rejects.toBe(transientError);
  await expect(getParser("test.wasm")).resolves.toMatchObject({ language });

  expect(mocks.init).toHaveBeenCalledTimes(2);
  expect(mocks.readFile).toHaveBeenCalledOnce();
});
