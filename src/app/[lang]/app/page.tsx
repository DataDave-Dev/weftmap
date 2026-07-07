import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { auth } from "@/auth";
import CodeWorkspace from "@/components/ui/CodeWorkspace";

import { getAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: "Weftmap — Editor",
    alternates: getAlternates("app", lang),
  };
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const session = await auth();

  return (
    <>
      <CodeWorkspace
        languageLabel={t.languageLabel}
        analyzeLabel={t.analyze}
        analyzingLabel={t.analyzing}
        inputPlaceholder={t.inputPlaceholder}
        diagramPlaceholder={t.diagramPlaceholder}
        noFunctions={t.noFunctions}
        noTables={t.noTables}
        snippetTab={t.snippetTab}
        projectTab={t.projectTab}
        uploadFolder={t.uploadFolder}
        projectHint={t.projectHint}
        resizePanelsLabel={t.aria.resizePanels}
        isAuthed={!!session?.user}
        saveLabel={t.auth.save}
        savedLabel={t.auth.saved}
        signInToSaveLabel={t.auth.signInToSave}
      />
    </>
  );
}
