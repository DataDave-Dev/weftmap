import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { REPO_URL } from "@/lib/constants";
import { LANDING_NAMES } from "@/lib/landing-languages";
import { SITE_NAME, SITE_URL, getSeoEntry } from "@/lib/seo";
import type { DocSlug } from "@/lib/docs";

/**
 * JSON-LD builders. Every payload is assembled from dictionary data and repo
 * constants — never from user input. `graphs/[id]` renders user-supplied titles
 * and therefore gets no structured data at all.
 */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

type Json = Record<string, unknown>;

function localeHome(lang: Locale): string {
  return `${SITE_URL}/${lang}`;
}

export function buildOrganization(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    sameAs: [REPO_URL],
  };
}

export function buildSoftwareApplication(lang: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description: getSeoEntry(lang, "home").description,
    url: localeHome(lang),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    inLanguage: lang,
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    programmingLanguage: LANDING_NAMES,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Built from the same `faqs` array the visible <Faq /> section renders. Google
 * penalizes FAQ markup describing content that isn't on the page, and sourcing
 * both from one array makes that divergence structurally impossible.
 */
export function buildFaqSchema(lang: Locale): Json {
  const { faqs } = getDictionary(lang);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export type Crumb = { name: string; path: string };

export function buildBreadcrumbs(lang: Locale, trail: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.path
        ? `${localeHome(lang)}/${crumb.path}`
        : localeHome(lang),
    })),
  };
}

export function buildTechArticle(lang: Locale, slug: DocSlug): Json {
  const { title, description } = getSeoEntry(lang, `docs.${slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    inLanguage: lang,
    url: `${localeHome(lang)}/docs/${slug}`,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
