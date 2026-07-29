import { describe, expect, test } from "vitest";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { TITLE_SUFFIX, getSeoEntry, type SeoKey } from "./seo";

// Google truncates around these points in a search result. With 6 locales and
// ~18 routes there are over 200 strings to keep inside them, and translations
// run 15-20% longer than their English source — far past eyeballing.
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 160;

const seoKeys = Object.keys(getDictionary("en").seo) as SeoKey[];

describe("SEO copy fits search-result limits", () => {
  test("there is at least one key to check", () => {
    expect(seoKeys.length).toBeGreaterThan(0);
  });

  for (const locale of locales) {
    for (const key of seoKeys) {
      const label = `${locale}/${key}`;

      test(`${label} title fits within ${TITLE_MAX} chars with the brand suffix`, () => {
        const composed = getSeoEntry(locale, key).title + TITLE_SUFFIX;
        expect(composed.length, composed).toBeLessThanOrEqual(TITLE_MAX);
      });

      test(`${label} description is ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} chars`, () => {
        const { description } = getSeoEntry(locale, key);
        expect(description.length, description).toBeGreaterThanOrEqual(
          DESCRIPTION_MIN,
        );
        expect(description.length, description).toBeLessThanOrEqual(
          DESCRIPTION_MAX,
        );
      });

      test(`${label} title and description are non-empty and untrimmed`, () => {
        const { title, description } = getSeoEntry(locale, key);
        expect(title).toBe(title.trim());
        expect(description).toBe(description.trim());
        expect(title.length).toBeGreaterThan(0);
      });
    }
  }
});