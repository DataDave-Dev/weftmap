import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";

export default function Header({ lang }: { lang: Locale }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/[0.08]">
      <Link
        href={`/${lang}`}
        className="metallic text-xl font-bold tracking-[0.02em]"
      >
        CodeViz
      </Link>

      <nav
        aria-label="Language"
        className="inline-flex gap-0.5 p-[3px] rounded-full bg-white/[0.08] border border-white/[0.14]"
      >
        {locales.map((locale) => {
          const active = locale === lang;
          return (
            <Link
              key={locale}
              href={`/${locale}`}
              aria-current={active ? "page" : undefined}
              className={`group px-3.5 py-[5px] rounded-full transition-colors ${
                active ? "bg-white/[0.16]" : ""
              }`}
            >
              <span
                className={`metallic text-[13px] font-semibold transition-opacity ${
                  active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                }`}
              >
                {locale.toUpperCase()}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
