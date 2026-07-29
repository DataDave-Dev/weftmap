import { describe, expect, test } from "vitest";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SUPPORTED_LANGUAGES, getAnalyzer } from "./analysis/registry";
import type { SourceFile } from "./analysis/types";
import { getSeoEntry } from "./seo";
import {
  EXCLUDED_FROM_LANDING,
  LANDING_IDS,
  LANDING_LANGUAGES,
} from "./landing-languages";

describe("landing language registry stays in sync", () => {
  // The repo's stated differentiator is that adding a language takes a few
  // lines. Without this, the eighth language ships with no landing page and
  // nobody notices for months.
  test.each(SUPPORTED_LANGUAGES)(
    "supported language '%s' has a landing page or an explicit exclusion",
    (language) => {
      const covered =
        (LANDING_IDS as string[]).includes(language) ||
        EXCLUDED_FROM_LANDING.includes(language);
      expect(covered, `add '${language}' to LANDING_LANGUAGES or EXCLUDED_FROM_LANDING`).toBe(
        true,
      );
    },
  );

  test("every landing id maps to a real analyzer", () => {
    for (const id of LANDING_IDS) {
      expect(getAnalyzer(id), id).toBeDefined();
    }
  });

  test("ids are unique", () => {
    expect(new Set(LANDING_IDS).size).toBe(LANDING_IDS.length);
  });
});

describe("landing snippets produce a non-trivial graph", () => {
  // The tripwire against placeholder content: a landing page whose example
  // doesn't actually analyze is thin programmatic content, which is exactly
  // what Google's scaled-content policy targets.
  test.each(LANDING_LANGUAGES)("$name snippet analyzes", async ({ id, extension, snippet }) => {
    const analyzer = getAnalyzer(id);
    expect(analyzer, id).toBeDefined();

    const files: SourceFile[] = [{ path: `example.${extension}`, content: snippet }];
    const graph = await analyzer!.analyzeProject(files);

    expect(graph.nodes.length, `${id} nodes`).toBeGreaterThanOrEqual(2);
    expect(graph.edges.length, `${id} edges`).toBeGreaterThanOrEqual(1);
  });

  test("SQL produces table nodes, not functions", async () => {
    const sql = LANDING_LANGUAGES.find((l) => l.id === "sql")!;
    const graph = await getAnalyzer("sql")!.analyzeProject([
      { path: "schema.sql", content: sql.snippet },
    ]);
    expect(graph.nodes.some((n) => n.type === "table")).toBe(true);
    expect(graph.edges.some((e) => e.kind === "references")).toBe(true);
  });
});

describe.each(locales)("landing copy for locale '%s' is not boilerplate", (lang) => {
  const pages = getDictionary(lang).landing.pages;
  const ids = LANDING_IDS;

  function fieldsOf(field: "h1" | "intro" | "shows") {
    return ids.map((id) => pages[id][field]);
  }

  test.each(["h1", "intro", "shows"] as const)(
    "every %s is unique within the locale",
    (field) => {
      const values = fieldsOf(field);
      expect(new Set(values).size, `duplicate ${field}`).toBe(values.length);
    },
  );

  test("titles and descriptions are unique within the locale", () => {
    const titles = ids.map((id) => getSeoEntry(lang, `landing.${id}`).title);
    const descriptions = ids.map(
      (id) => getSeoEntry(lang, `landing.${id}`).description,
    );
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  test("copy differs by more than a substituted language name", () => {
    // Blank out each language's own name, then compare. If two pages are the
    // same sentence with the name swapped, they collide here.
    const skeletons = LANDING_LANGUAGES.map(({ id, name }) =>
      pages[id].shows.replaceAll(name, "@").toLowerCase(),
    );
    expect(new Set(skeletons).size).toBe(skeletons.length);
  });

  test("every h1 names its language", () => {
    for (const { id, name } of LANDING_LANGUAGES) {
      expect(pages[id].h1, id).toContain(name);
    }
  });
});
