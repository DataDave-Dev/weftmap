import { describe, expect, test, vi } from "vitest";
import { clearAnalysisResult } from "./codeWorkspaceState";

describe("clearAnalysisResult", () => {
  test("clears both graph and error state when workspace input changes", () => {
    const setGraph = vi.fn();
    const setError = vi.fn();

    clearAnalysisResult(setGraph, setError);

    expect(setGraph).toHaveBeenCalledOnce();
    expect(setGraph).toHaveBeenCalledWith(null);
    expect(setError).toHaveBeenCalledOnce();
    expect(setError).toHaveBeenCalledWith(null);
  });
});
