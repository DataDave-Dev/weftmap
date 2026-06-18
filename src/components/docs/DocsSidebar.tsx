"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { DOC_NAV } from "@/lib/docs";

export default function DocsSidebar({
  lang,
  showHeading = true,
}: {
  lang: Locale;
  showHeading?: boolean;
}) {
  const pathname = usePathname();
  const t = getDictionary(lang);

  return (
    <nav aria-label="Docs">
      {showHeading && (
        <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
          {t.documentation}
        </p>
      )}
      <div className="flex flex-col border-l border-line dark:border-border-dark">
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
                  ? "border-brand font-medium text-brand dark:border-brand-dark dark:text-brand-dark-hover"
                  : "border-transparent text-ink-soft dark:text-muted hover:border-slate-300 dark:hover:border-muted hover:text-ink dark:hover:text-fg"
              }`}
            >
              {d.title[lang] ?? d.title["en"]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
