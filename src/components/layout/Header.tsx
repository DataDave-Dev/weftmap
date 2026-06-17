"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const REPO = "https://github.com/DataDave-Dev/weftmap";

export default function Header({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    const id = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(id);
    };
  }, []);

  const linkClass =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-[#475569] hover:text-[#0f172a] hover:bg-black/[0.04] transition-colors dark:text-[#94a3b8] dark:hover:text-[#e6e9ef] dark:hover:bg-white/[0.06]";

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-[#e2e8f0] dark:bg-[#0b0d12]/80 dark:border-[#232a36]"
          : "bg-transparent border-transparent"
      }`}
    >
      <Link
        href={`/${lang}`}
        className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-[0.02em]"
      >
        <Logo className="h-6 w-6 text-[#0f172a] dark:text-[#e6e9ef]" />
        <span className="text-[#0f172a] dark:text-[#e6e9ef]">Weftmap</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <nav aria-label="Sections" className="hidden sm:flex items-center gap-1">
          <Link href={`/${lang}/docs`} className={linkClass}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Docs
          </Link>
          <a href={REPO} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.83.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
            </svg>
            GitHub
          </a>
        </nav>

        <ThemeToggle />

        <Link
          href={`/${lang}/app`}
          className="shrink-0 whitespace-nowrap rounded-full bg-[#4f46e5] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#4338ca] sm:px-4 dark:bg-[#6366f1] dark:hover:bg-[#4f46e5]"
        >
          {t.getStarted}
        </Link>

        <nav
          aria-label="Language"
          className="inline-flex shrink-0 gap-0.5 p-[3px] rounded-full border bg-black/[0.04] border-[#e2e8f0] dark:bg-white/[0.06] dark:border-[#232a36]"
        >
          {locales.map((locale) => {
            const active = locale === lang;
            return (
              <Link
                key={locale}
                href={`/${locale}`}
                aria-current={active ? "page" : undefined}
                className={`group px-3.5 py-[5px] rounded-full transition-colors ${
                  active ? "bg-black/[0.06] dark:bg-white/[0.12]" : ""
                }`}
              >
                <span
                  className={`text-[13px] font-semibold transition-colors ${
                    active
                      ? "text-[#0f172a] dark:text-[#e6e9ef]"
                      : "text-[#64748b] group-hover:text-[#0f172a] dark:text-[#8b96a7] dark:group-hover:text-[#e6e9ef]"
                  }`}
                >
                  {locale.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
