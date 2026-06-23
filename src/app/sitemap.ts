import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { DOC_SLUGS } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://weftmap.com";
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    // Homepage: /:lang
    entries.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });

    // App page: /:lang/app
    entries.push({
      url: `${baseUrl}/${lang}/app`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });

    // Docs index: /:lang/docs
    entries.push({
      url: `${baseUrl}/${lang}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });

    // Docs pages: /:lang/docs/:slug
    for (const slug of DOC_SLUGS) {
      entries.push({
        url: `${baseUrl}/${lang}/docs/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
