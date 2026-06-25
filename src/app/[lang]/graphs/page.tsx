import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { auth } from "@/auth";
import { listGraphs } from "@/lib/graphs";
import GraphListItem from "@/components/ui/GraphListItem";

import { getAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: "Weftmap — My graphs",
    alternates: getAlternates("graphs", lang),
  };
}

export default async function GraphsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-[#0f172a] dark:text-[#e6e9ef]">
        {t.auth.graphsTitle}
      </h1>

      {!session?.user ? (
        <p className="text-[#475569] dark:text-[#9aa6b8]">
          {t.auth.graphsSignIn}
        </p>
      ) : (
        <GraphList lang={lang} t={t} />
      )}
    </main>
  );
}

async function GraphList({
  lang,
  t,
}: {
  lang: Locale;
  t: ReturnType<typeof getDictionary>;
}) {
  const graphs = await listGraphs();

  if (graphs.length === 0) {
    return (
      <p className="text-[#475569] dark:text-[#9aa6b8]">{t.auth.graphsEmpty}</p>
    );
  }

  return (
    <ul className="divide-y divide-[#eef1f5] dark:divide-[#232a36] overflow-hidden rounded-xl border border-[#e2e8f0] dark:border-[#232a36]">
      {graphs.map((g) => (
        <GraphListItem
          key={g.id}
          id={g.id}
          title={g.title}
          language={g.language}
          dateLabel={new Date(g.createdAt).toLocaleDateString(lang)}
          href={`/${lang}/graphs/${g.id}`}
          openLabel={t.auth.open}
          deleteLabel={t.auth.delete}
        />
      ))}
    </ul>
  );
}
