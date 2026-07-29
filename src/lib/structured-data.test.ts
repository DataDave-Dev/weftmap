import { describe, expect, test } from "vitest";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { DOC_SLUGS, type DocSlug } from "./docs";
import { SITE_URL } from "./seo";
import {
  buildBreadcrumbs,
  buildFaqSchema,
  buildOrganization,
  buildSoftwareApplication,
  buildTechArticle,
} from "./structured-data";

function collectUndefinedPaths(value: unknown, path = "$"): string[] {
  if (value === undefined) return [path];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectUndefinedPaths(item, `${path}[${i}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, val]) =>
      collectUndefinedPaths(val, `${path}.${key}`),
    );
  }
  return [];
}

function builders(lang: (typeof locales)[number]) {
  return {
    Organization: buildOrganization(),
    SoftwareApplication: buildSoftwareApplication(lang),
    FAQPage: buildFaqSchema(lang),
    BreadcrumbList: buildBreadcrumbs(lang, [
      { name: "Weftmap", path: "" },
      { name: "Docs", path: "docs/introduction" },
    ]),
    TechArticle: buildTechArticle(lang, "introduction"),
  };
}

describe.each(locales)("structured data for locale '%s'", (lang) => {
  const built = builders(lang);

  test.each(Object.keys(built))("%s declares schema.org context and a type", (name) => {
    const node = built[name as keyof typeof built] as Record<string, unknown>;
    expect(node["@context"]).toBe("https://schema.org");
    expect(node["@type"]).toBe(name);
  });

  test.each(Object.keys(built))("%s contains no undefined values", (name) => {
    const node = built[name as keyof typeof built];
    expect(collectUndefinedPaths(node, name)).toEqual([]);
  });

  test("FAQPage mirrors the visible FAQ content exactly", () => {
    const { faqs } = getDictionary(lang);
    const schema = buildFaqSchema(lang) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(schema.mainEntity).toHaveLength(faqs.length);
    schema.mainEntity.forEach((entry, i) => {
      expect(entry.name).toBe(faqs[i].q);
      expect(entry.acceptedAnswer.text).toBe(faqs[i].a);
    });
  });

  test("SoftwareApplication is free and lists the supported languages", () => {
    const app = buildSoftwareApplication(lang) as {
      offers: { price: string };
      programmingLanguage: string[];
      description: string;
    };
    expect(app.offers.price).toBe("0");
    expect(app.programmingLanguage).toContain("Python");
    expect(app.programmingLanguage).toContain("SQL");
    expect(app.description).toBe(getDictionary(lang).seo.home.description);
  });

  test("breadcrumb items are absolute and correctly positioned", () => {
    const crumbs = buildBreadcrumbs(lang, [
      { name: "Weftmap", path: "" },
      { name: "Docs", path: "docs/introduction" },
      { name: "Languages", path: "docs/languages" },
    ]) as { itemListElement: { position: number; item: string }[] };

    expect(crumbs.itemListElement.map((c) => c.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[0].item).toBe(`${SITE_URL}/${lang}`);
    expect(crumbs.itemListElement[2].item).toBe(
      `${SITE_URL}/${lang}/docs/languages`,
    );
  });

  test.each(DOC_SLUGS)("TechArticle for '%s' is localized and linked", (slug) => {
    const article = buildTechArticle(lang, slug as DocSlug) as {
      inLanguage: string;
      url: string;
      headline: string;
    };
    expect(article.inLanguage).toBe(lang);
    expect(article.url).toBe(`${SITE_URL}/${lang}/docs/${slug}`);
    expect(article.headline.length).toBeGreaterThan(0);
  });
});

describe("Organization", () => {
  test("links to the GitHub repository", () => {
    const org = buildOrganization() as { sameAs: string[] };
    expect(org.sameAs).toContain("https://github.com/DataDave-Dev/weftmap");
  });
});
