import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LANDING_LANGUAGES, getLandingLanguage } from "@/lib/landing-languages";
import { buildMetadata, getSeoEntry } from "@/lib/seo";
import { buildBreadcrumbs } from "@/lib/structured-data";
import { CodeBlock } from "@/components/docs/Prose";
import JsonLd from "@/components/seo/JsonLd";

// Statically generated for the full locale x language cross product, so a
// crawler gets complete HTML with nothing deferred to hydration.
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    LANDING_LANGUAGES.map(({ id }) => ({ lang, language: id })),
  );
}

type Params = Promise<{ lang: string; language: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang, language } = await params;
  const entry = getLandingLanguage(language);
  if (!isLocale(lang) || !entry) return {};

  return buildMetadata({
    lang,
    path: `call-graph/${entry.id}`,
    seoKey: `landing.${entry.id}`,
  });
}

export default async function CallGraphLandingPage({
  params,
}: {
  params: Params;
}) {
  const { lang, language } = await params;
  if (!isLocale(lang)) notFound();

  const entry = getLandingLanguage(language);
  if (!entry) notFound();

  const t = getDictionary(lang as Locale);
  const copy = t.landing.pages[entry.id];
  const { title } = getSeoEntry(lang, `landing.${entry.id}`);

  const others = LANDING_LANGUAGES.filter((l) => l.id !== entry.id);

  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-16 sm:py-24">
      {/* Two levels only: there is no /call-graph index page, and a breadcrumb
          pointing at a URL that doesn't exist is worse than a shorter trail. */}
      <JsonLd
        data={buildBreadcrumbs(lang, [
          { name: "Weftmap", path: "" },
          { name: title, path: `call-graph/${entry.id}` },
        ])}
      />

      <span className="block font-mono text-[12px] tracking-[0.28em] text-[#94a3b8]">
        {entry.name.toUpperCase()}
      </span>
      <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.025em] text-[#0f172a] dark:text-[#e6e9ef]">
        {copy.h1}
      </h1>
      <p className="mt-6 max-w-[52ch] text-[1.05rem] leading-relaxed text-[#475569] dark:text-[#9aa6b8]">
        {copy.intro}
      </p>

      <Link
        href={`/${lang}/app`}
        className="mt-8 inline-block rounded-full bg-[#4f46e5] dark:bg-[#6366f1] px-7 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.6)] transition hover:-translate-y-px hover:bg-[#4338ca]"
      >
        {t.landing.ctaButton}
      </Link>

      <section className="mt-16">
        <h2 className="border-b border-[#e2e8f0] dark:border-[#232a36] pb-2 text-xl font-semibold tracking-[-0.01em] text-[#0f172a] dark:text-[#e6e9ef]">
          {t.landing.exampleHeading}
        </h2>
        {/* dir="ltr" so the snippet stays left-to-right inside the RTL Arabic
            layout — code is not prose. */}
        <div dir="ltr">
          <CodeBlock label={`example.${entry.extension}`}>
            {entry.snippet}
          </CodeBlock>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="border-b border-[#e2e8f0] dark:border-[#232a36] pb-2 text-xl font-semibold tracking-[-0.01em] text-[#0f172a] dark:text-[#e6e9ef]">
          {t.landing.showsHeading}
        </h2>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-7 text-[#475569] dark:text-[#9aa6b8]">
          {copy.shows}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          <Link
            href={`/${lang}/docs/reading-the-diagram`}
            className="text-[#4f46e5] underline-offset-4 hover:underline dark:text-[#818cf8]"
          >
            {t.landing.docsReadDiagram}
          </Link>
          <Link
            href={`/${lang}/docs/languages`}
            className="text-[#4f46e5] underline-offset-4 hover:underline dark:text-[#818cf8]"
          >
            {t.landing.docsLanguages}
          </Link>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c] p-8">
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.01em] text-[#0f172a] dark:text-[#e6e9ef]">
          {t.landing.ctaTitle}
        </h2>
        <p className="mt-3 max-w-[48ch] text-[15px] leading-7 text-[#475569] dark:text-[#9aa6b8]">
          {t.landing.ctaDesc}
        </p>
        <Link
          href={`/${lang}/app`}
          className="mt-6 inline-block rounded-full bg-[#4f46e5] dark:bg-[#6366f1] px-7 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#4338ca]"
        >
          {t.landing.ctaButton}
        </Link>
      </section>

      <nav
        aria-label={t.landing.docsLanguages}
        className="mt-14 flex flex-wrap gap-2 border-t border-[#e2e8f0] dark:border-[#232a36] pt-8"
      >
        {others.map((other) => (
          <Link
            key={other.id}
            href={`/${lang}/call-graph/${other.id}`}
            className="rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-3 py-1.5 font-mono text-xs text-[#475569] dark:text-[#9aa6b8] transition-colors hover:border-[#4f46e5] hover:text-[#0f172a] dark:hover:text-[#e6e9ef]"
          >
            {other.name}
          </Link>
        ))}
      </nav>
    </main>
  );
}
