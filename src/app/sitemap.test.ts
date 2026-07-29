import { describe, expect, test } from "vitest";
import { locales } from "@/i18n/config";
import { DOC_SLUGS } from "@/lib/docs";
import { LANDING_IDS } from "@/lib/landing-languages";
import { SITE_URL } from "@/lib/seo";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();

  test("excludes auth-gated graph routes", () => {
    expect(entries.filter((e) => e.url.includes("/graphs"))).toEqual([]);
  });

  test("includes the homepage once per locale", () => {
    const homepages = entries.filter((e) =>
      locales.some((lang) => e.url === `${SITE_URL}/${lang}`),
    );
    expect(homepages).toHaveLength(locales.length);
  });

  test("includes every docs slug in every locale", () => {
    for (const lang of locales) {
      for (const slug of DOC_SLUGS) {
        expect(entries.some((e) => e.url === `${SITE_URL}/${lang}/docs/${slug}`)).toBe(
          true,
        );
      }
    }
  });

  test("includes every language landing page in every locale", () => {
    for (const lang of locales) {
      for (const id of LANDING_IDS) {
        expect(
          entries.some((e) => e.url === `${SITE_URL}/${lang}/call-graph/${id}`),
          `${lang}/${id}`,
        ).toBe(true);
      }
    }
  });

  test("excludes /docs, which redirects to /docs/introduction", () => {
    for (const lang of locales) {
      expect(entries.some((e) => e.url === `${SITE_URL}/${lang}/docs`)).toBe(
        false,
      );
    }
  });

  test("every entry carries a complete hreflang map", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages;
      expect(languages, entry.url).toBeDefined();
      for (const locale of locales) {
        expect(languages?.[locale], `${entry.url} → ${locale}`).toBeDefined();
      }
      expect(languages?.["x-default"], entry.url).toBeDefined();
    }
  });

  test("every entry has a priority and change frequency", () => {
    for (const entry of entries) {
      expect(entry.priority, entry.url).toBeTypeOf("number");
      expect(entry.changeFrequency, entry.url).toBeDefined();
    }
  });

  test("lastModified is stable across calls within a deploy", () => {
    const first = sitemap()[0].lastModified;
    const second = sitemap()[0].lastModified;
    expect(first).toEqual(second);
  });

  test("every URL is absolute and well-formed", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith(SITE_URL)).toBe(true);
      expect(entry.url.slice("https://".length)).not.toContain("//");
    }
  });
});
