import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
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
    <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:py-20">
        {/* Mobile docs nav (sidebar is hidden below lg). */}
        <details className="group mb-2 rounded-xl border border-[#e2e8f0] bg-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-[#0f172a] [&::-webkit-details-marker]:hidden">
            {lang === "es" ? "Documentación" : "Documentation"}
            <span aria-hidden="true" className="font-mono text-[#94a3b8] transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="border-t border-[#e2e8f0] px-4 py-3">
            <DocsSidebar lang={lang as Locale} showHeading={false} />
          </div>
        </details>
        <aside className="hidden lg:block">
          <div className="sticky top-[96px]">
            <DocsSidebar lang={lang as Locale} />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
    </div>
  );
}
