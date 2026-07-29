import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /api has nothing to index; /graphs is auth-gated, so a crawler only
      // ever sees the signed-out shell. Both also carry a noindex meta tag —
      // disallow stops the crawl, noindex covers URLs found via external links.
      disallow: ["/api/", "/*/graphs", "/*/graphs/*"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
