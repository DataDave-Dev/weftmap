import { describe, expect, test } from "vitest";
import { getAnalyzer, SUPPORTED_LANGUAGES } from "./registry";

describe("analysis registry", () => {
  test("returns an analyzer for every supported language", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const analyzer = getAnalyzer(language);

      expect(analyzer?.language).toBe(language);
      expect(typeof analyzer?.analyzeProject).toBe("function");
    }
  });

  test("returns undefined for unsupported languages", () => {
    expect(getAnalyzer("unknown")).toBeUndefined();
    expect(getAnalyzer("")).toBeUndefined();
  });
});
