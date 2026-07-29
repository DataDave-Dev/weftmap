import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export const SITE_URL = "https://weftmap.vercel.app";

export const SITE_NAME = "Weftmap";

// Appended to every child-route title by the layout's title.template, and to
// the homepage title by title.default. Titles are budgeted around it: the
// composed result must stay under 60 chars or Google truncates it.
export const TITLE_SUFFIX = ` — ${SITE_NAME}`;

// Shared with src/app/[lang]/opengraph-image.tsx, which renders the image.
// English-only on purpose: Satori's default font has no Arabic coverage.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_ALT =
  "Weftmap — interactive call graphs from source code";

export type SeoKey = keyof Dictionary["seo"];

type SeoEntry = { title: string; description: string };

// OpenGraph wants a full locale identifier, not the bare language subtag.
const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  pt: "pt_BR",
  ar: "ar_AR",
  fr: "fr_FR",
  it: "it_IT",
};

export function getAlternates(path: string, currentLang: string) {
  // cleanPath should start with slash if path is not empty, otherwise empty string
  const cleanPath = path ? `/${path}` : "";

  const languages = locales.reduce(
    (acc, locale) => {
      acc[locale] = `${SITE_URL}/${locale}${cleanPath}`;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Set default fallback language version to English
  languages["x-default"] = `${SITE_URL}/en${cleanPath}`;

  return {
    canonical: `${SITE_URL}/${currentLang}${cleanPath}`,
    languages,
  };
}

// The i18n key-parity test makes a missing key a build failure, so this
// fallback should never fire. Kept so a half-translated dictionary degrades to
// English rather than rendering an empty title.
export function getSeoEntry(lang: Locale, key: SeoKey): SeoEntry {
  const localized = getDictionary(lang).seo as Record<string, SeoEntry | undefined>;
  const english = getDictionary("en").seo as Record<string, SeoEntry>;
  return localized[key] ?? english[key];
}

/**
 * Composes the full metadata for a route: localized title and description,
 * canonical, hreflang, OpenGraph and Twitter card — all from one computation,
 * so og:url and rel="canonical" cannot drift apart.
 *
 * The image is declared explicitly rather than left to the opengraph-image file
 * convention: setting `openGraph` in a child segment REPLACES the parent's
 * whole openGraph object, so the file-based image silently disappears from
 * every route except the homepage.
 */
export function buildMetadata({
  lang,
  path,
  seoKey,
}: {
  lang: Locale;
  path: string;
  seoKey: SeoKey;
}): Metadata {
  const { title, description } = getSeoEntry(lang, seoKey);
  const { canonical, languages } = getAlternates(path, lang);
  const images = [
    { url: `/${lang}/opengraph-image`, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT },
  ];

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      url: canonical,
      title: title + TITLE_SUFFIX,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALES[lang],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: title + TITLE_SUFFIX,
      description,
      images,
    },
  };
}
