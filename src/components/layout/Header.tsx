"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const REPO = "https://github.com/DataDave-Dev/weftmap";

const SCROLL_THRESHOLD = 8;

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
// Server (and first client paint) assume top-of-page: no flash when the real
// scroll position matches, and useSyncExternalStore reconciles if it doesn't.
const getScrolledServer = () => false;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  ar: "العربية",
  fr: "Français",
  it: "Italiano",
};

export default function Header({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolled,
    getScrolledServer,
  );

  const getRedirectPath = (targetLocale: string) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/");
    if (
      segments.length > 1 &&
      (locales as readonly string[]).includes(segments[1])
    ) {
      segments[1] = targetLocale;
      return segments.join("/");
    }
    return `/${targetLocale}`;
  };

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
        <nav
          aria-label="Sections"
          className="hidden sm:flex items-center gap-1"
        >
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
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
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

        <div className="relative shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label="Select language"
            className="flex items-center gap-1.5 px-3.5 py-[6px] rounded-full border text-[13px] font-semibold transition-all bg-black/[0.04] border-[#e2e8f0] text-[#0f172a] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-[#cbd5e1] dark:hover:bg-white/[0.16]"
          >
            <span>🌐</span>
            <span>{LANGUAGE_NAMES[lang] ?? lang.toUpperCase()}</span>
            <span className="text-[9px] opacity-60">▼</span>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 rtl:left-0 rtl:right-auto z-20 mt-2 w-36 rounded-xl border p-1 shadow-lg transition-all bg-white border-[#e2e8f0] dark:bg-[#0b0d12] dark:border-[#232a36]">
                {locales.map((locale) => {
                  const active = locale === lang;
                  return (
                    <Link
                      key={locale}
                      href={getRedirectPath(locale)}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-left text-[13px] font-medium transition-colors ${
                        active
                          ? "bg-[#f1f5f9] text-[#4f46e5] dark:bg-white/[0.08] dark:text-white"
                          : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:bg-white/[0.04] dark:hover:text-white"
                      }`}
                    >
                      <span>
                        {LANGUAGE_NAMES[locale] ?? locale.toUpperCase()}
                      </span>
                      {active && <span className="text-[10px]">✓</span>}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
