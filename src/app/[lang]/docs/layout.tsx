import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import Header from "@/components/layout/Header";
import DocsSidebar from "@/components/docs/DocsSidebar";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function DocsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <Header lang={lang as Locale} variant="light" />
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-10 lg:grid-cols-[220px_1fr] lg:gap-14 lg:py-16">
        <aside className="hidden lg:block">
          <div className="sticky top-[92px]">
            <DocsSidebar lang={lang as Locale} />
          </div>
        </aside>
        <main className="min-w-0 max-w-[760px]">{children}</main>
      </div>
    </>
  );
}
