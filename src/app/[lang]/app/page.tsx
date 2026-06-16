import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import Header from "@/components/layout/Header";
import CodeWorkspace from "@/components/ui/CodeWorkspace";

export const metadata: Metadata = {
  title: "CodeViz — Editor",
};

export default async function AppPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <Header lang={lang} />
      <CodeWorkspace
        languageLabel={t.languageLabel}
        analyzeLabel={t.analyze}
        analyzingLabel={t.analyzing}
        inputPlaceholder={t.inputPlaceholder}
        diagramPlaceholder={t.diagramPlaceholder}
        noFunctions={t.noFunctions}
        snippetTab={t.snippetTab}
        projectTab={t.projectTab}
        uploadFolder={t.uploadFolder}
        projectHint={t.projectHint}
      />
    </>
  );
}
