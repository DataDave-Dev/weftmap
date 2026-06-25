import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { auth } from "@/auth";
import { getGraph } from "@/lib/graphs";
import Diagram from "@/components/ui/Diagram";
import type { Graph } from "@/lib/analysis/types";

import { getAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  return {
    title: "Weftmap — Saved graph",
    alternates: getAlternates(`graphs/${id}`, lang),
  };
}

export default async function SavedGraphPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const session = await auth();
  if (!session?.user) notFound();

  const row = await getGraph(id);
  if (!row) notFound();

  const graph = JSON.parse(row.graph) as Graph;
  const emptyLabel = row.language === "sql" ? t.noTables : t.noFunctions;

  return (
    <main className="flex h-[calc(100vh-65px)] flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
            {row.title}
          </h1>
          <span className="font-mono text-[12px] text-[#64748b] dark:text-[#7c8696]">
            {row.language} · {graph.nodes.length} nodes · {graph.edges.length}{" "}
            edges
          </span>
        </div>
        <Link
          href={`/${lang}/graphs`}
          className="shrink-0 rounded-lg border border-[#e2e8f0] dark:border-[#232a36] px-3 py-1.5 text-[12px] text-[#475569] dark:text-[#9aa6b8] transition-colors hover:border-[#4f46e5] hover:text-[#0f172a]"
        >
          {t.auth.graphsTitle}
        </Link>
      </header>
      <div className="relative flex-1 bg-[#f6f7f9] dark:bg-[#0b0d12]">
        <div className="absolute inset-0">
          <Diagram graph={graph} emptyLabel={emptyLabel} />
        </div>
      </div>
    </main>
  );
}
