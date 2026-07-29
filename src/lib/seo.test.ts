import { describe, expect, test } from "vitest";
import { locales } from "@/i18n/config";
import { SITE_URL, getAlternates } from "./seo";

describe("SITE_URL", () => {
  test("has no trailing slash", () => {
    expect(SITE_URL).not.toMatch(/\/$/);
  });

  test("is the origin verified in Search Console", () => {
    expect(SITE_URL).toBe("https://weftmap.vercel.app");
  });
});

describe("getAlternates", () => {
  const paths = ["", "app", "docs", "docs/languages"];

  test.each(paths)("path '%s' yields an entry for every locale", (path) => {
    const { languages } = getAlternates(path, "en");
    for (const locale of locales) {
      expect(languages[locale]).toBeDefined();
    }
  });

  test.each(paths)("path '%s' declares x-default pointing at English", (path) => {
    const { languages } = getAlternates(path, "es");
    expect(languages["x-default"]).toBe(languages.en);
  });

  test.each(paths)("path '%s' produces absolute, well-formed URLs", (path) => {
    const { canonical, languages } = getAlternates(path, "es");
    for (const url of [canonical, ...Object.values(languages)]) {
      expect(url.startsWith(SITE_URL)).toBe(true);
      // No double slash after the scheme.
      expect(url.slice("https://".length)).not.toContain("//");
      expect(() => new URL(url)).not.toThrow();
    }
  });

  test("canonical reflects the current locale", () => {
    expect(getAlternates("docs/faq", "pt").canonical).toBe(
      `${SITE_URL}/pt/docs/faq`,
    );
  });

  test("empty path yields the locale homepage without a trailing slash", () => {
    expect(getAlternates("", "fr").canonical).toBe(`${SITE_URL}/fr`);
  });
});
