import type { MetadataRoute } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale } from "@/i18n/config";

// Served at /manifest.webmanifest. The extension keeps it outside the proxy's
// locale-redirect matcher, so it stays reachable at the root.
export default function manifest(): MetadataRoute.Manifest {
  const t = getDictionary(defaultLocale);

  return {
    name: "Weftmap — call graphs from source code",
    short_name: "Weftmap",
    description: t.seo.home.description,
    // The proxy redirects a bare "/" to a locale anyway; pointing straight at
    // /en skips that hop when the app is launched from the home screen.
    start_url: "/en",
    display: "standalone",
    background_color: "#0b0d12",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
