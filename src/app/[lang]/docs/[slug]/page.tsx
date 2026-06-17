import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { DOC_NAV, DOC_SLUGS, type DocSlug } from "@/lib/docs";
import { DOC_COMPONENTS } from "@/components/docs/registry";

export function generateStaticParams() {
  return locales.flatMap((lang) => DOC_SLUGS.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = DOC_NAV.find((d) => d.slug === slug);
  const locale: Locale = isLocale(lang) ? lang : "en";
  const title = item ? item.title[locale] : "Docs";
  return { title: `${title} — Weftmap` };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const index = DOC_NAV.findIndex((d) => d.slug === slug);
  if (index === -1) notFound();

  const Content = DOC_COMPONENTS[slug as DocSlug];
  const prev = DOC_NAV[index - 1];
  const next = DOC_NAV[index + 1];

  return (
    <article>
      <Content lang={lang} />

      <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-[#e2e8f0] pt-8">
        {prev ? (
          <Link
            href={`/${lang}/docs/${prev.slug}`}
            className="group rounded-xl border border-[#e2e8f0] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#c7d2fe] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#94a3b8]">
              {lang === "es" ? "Anterior" : "Previous"}
            </span>
            <span className="mt-1 block font-medium text-[#0f172a] transition-colors group-hover:text-[#4f46e5]">
              ← {prev.title[lang]}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/${lang}/docs/${next.slug}`}
            className="group rounded-xl border border-[#e2e8f0] bg-white p-4 text-right transition-all hover:-translate-y-0.5 hover:border-[#c7d2fe] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#94a3b8]">
              {lang === "es" ? "Siguiente" : "Next"}
            </span>
            <span className="mt-1 block font-medium text-[#0f172a] transition-colors group-hover:text-[#4f46e5]">
              {next.title[lang]} →
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
