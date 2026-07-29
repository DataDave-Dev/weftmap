import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { DOC_SLUGS } from "@/lib/docs";
import { LANDING_IDS } from "@/lib/landing-languages";
import { getAlternates } from "@/lib/seo";

// Evaluated once when the module loads, not per request. force-static below
// pins that to build time, so repeated crawls of unchanged content don't report
// a fresh modification date every fetch.
const LAST_MODIFIED = new Date();

export const dynamic = "force-static";

// path is relative to /:lang. "" is the locale homepage.
// /graphs is deliberately absent: auth-gated, noindex, disallowed in robots.txt.
type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

function routes(): Route[] {
  return [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "app", changeFrequency: "monthly", priority: 0.8 },
    // /docs is absent on purpose: it 307s to /docs/introduction, and a
    // redirecting URL in a sitemap just burns crawl budget.
    // Above the docs: these target the queries the site is actually trying to
    // win, and each is a conversion path into /app.
    ...LANDING_IDS.map((id): Route => ({
      path: `call-graph/${id}`,
      changeFrequency: "monthly",
      priority: 0.9,
    })),
    ...DOC_SLUGS.map((slug): Route => ({
      path: `docs/${slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    routes().map(({ path, changeFrequency, priority }) => {
      const { canonical, languages } = getAlternates(path, lang);
      return {
        url: canonical,
        lastModified: LAST_MODIFIED,
        changeFrequency,
        priority,
        // Mirrors the <link rel="alternate"> tags in the document head, so the
        // two hreflang signals cannot diverge.
        alternates: { languages },
      };
    }),
  );
}
