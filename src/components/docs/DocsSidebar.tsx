"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { DOC_NAV } from "@/lib/docs";

export default function DocsSidebar({
  lang,
  showHeading = true,
}: {
  lang: Locale;
  showHeading?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Docs">
      {showHeading && (
        <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
          {lang === "es" ? "Documentación" : "Documentation"}
        </p>
      )}
      <div className="flex flex-col border-l border-[#e2e8f0] dark:border-[#232a36]">
        {DOC_NAV.map((d) => {
          const href = `/${lang}/docs/${d.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={d.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`-ml-px border-l-2 px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-[#4f46e5] font-medium text-[#4f46e5] dark:text-[#a5b4fc]"
                  : "border-transparent text-[#475569] dark:text-[#9aa6b8] hover:border-[#cbd5e1] hover:text-[#0f172a]"
              }`}
            >
              {d.title[lang]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
