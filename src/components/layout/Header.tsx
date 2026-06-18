"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { signInGitHub, signOutAction } from "@/lib/auth-actions";
import { REPO_URL } from "@/lib/constants";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

type HeaderUser = {
  name?: string | null;
  image?: string | null;
  username?: string | null;
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  ar: "العربية",
  fr: "Français",
  it: "Italiano",
};

const BookIcon = (
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
);

const GitHubIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.83.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
  </svg>
);

const linkClass =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-ink-soft hover:text-ink hover:bg-black/[0.04] transition-colors dark:text-muted dark:hover:text-fg dark:hover:bg-surface-hover";

const pillClass =
  "flex items-center gap-1.5 rounded-full border border-line dark:border-border-dark px-3 py-1.5 text-[13px] font-medium text-ink-soft dark:text-muted hover:border-brand hover:text-ink dark:hover:border-brand-dark dark:hover:text-fg dark:hover:bg-surface-hover transition-colors";

const ctaClass =
  "shrink-0 whitespace-nowrap rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:-translate-y-px hover:bg-brand-hover sm:px-4 dark:bg-brand-dark dark:hover:bg-brand-dark-hover";

const signInClass =
  "whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-black/[0.04] dark:border-border-dark dark:text-fg dark:hover:bg-surface-hover";

const menuItemClass =
  "flex w-full items-center px-3 py-2 rounded-lg text-left text-[13px] font-medium text-ink-soft hover:bg-slate-50 hover:text-ink dark:text-muted dark:hover:bg-surface-hover dark:hover:text-fg transition-colors";

export default function Header({
  lang,
  user,
  stars,
}: {
  lang: Locale;
  user: HeaderUser | null;
  stars: string | null;
}) {
  const t = getDictionary(lang);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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

  const docsLink = (extra = "") => (
    <Link href={`/${lang}/docs`} className={`${linkClass} ${extra}`}>
      {BookIcon}
      Docs
    </Link>
  );

  const starsLink = (extra = "") => (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.ctaStar}
      className={`${pillClass} ${extra}`}
    >
      {GitHubIcon}
      <span>{stars ? `★ ${stars}` : "GitHub"}</span>
    </a>
  );

  const avatar = (size: number) =>
    user?.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name ?? ""}
        width={size}
        height={size}
        className="rounded-full"
      />
    ) : (
      <span
        style={{ width: size, height: size }}
        className="grid place-items-center rounded-full bg-[#4f46e5] text-[11px] font-semibold text-white"
      >
        {(user?.name ?? "?").charAt(0).toUpperCase()}
      </span>
    );

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3.5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:px-6 sm:py-4 border-b border-[#e2e8f0] dark:border-[#232a36] backdrop-blur-xl bg-white/80 dark:bg-[#0b0d12]/80"
    >
      {/* ── Left: brand ── */}
      <Link
        href={`/${lang}`}
        className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-[0.02em]"
      >
        <Logo className="h-6 w-6 text-[#0f172a] dark:text-[#e6e9ef]" />
        <span className="text-[#0f172a] dark:text-[#e6e9ef]">Weftmap</span>
      </Link>

      {/* ── Center: primary nav (desktop) ── */}
      <nav
        aria-label="Sections"
        className="hidden sm:flex items-center justify-center gap-1"
      >
        {docsLink()}
        {starsLink()}
      </nav>

      {/* ── Right: utilities + account ── */}
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Language dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              aria-label="Select language"
              className="flex items-center gap-1.5 px-3.5 py-[6px] rounded-full border text-[13px] font-semibold transition-all bg-black/[0.04] border-line text-ink hover:bg-black/[0.08] dark:bg-surface dark:border-border-dark dark:text-fg dark:hover:bg-surface-hover"
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
                            ? "bg-slate-100 text-brand dark:bg-surface-active dark:text-fg"
                            : "text-ink-soft hover:bg-slate-50 hover:text-ink dark:text-muted dark:hover:bg-surface-hover dark:hover:text-fg"
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

          <Link href={`/${lang}/app`} className={ctaClass}>
            {t.getStarted}
          </Link>

          {user ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-line p-0.5 pr-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-black/[0.04] dark:border-border-dark dark:text-fg dark:hover:bg-surface-hover"
              >
                {avatar(26)}
                <span className="max-w-[120px] truncate">
                  {user.username
                    ? `@${user.username}`
                    : (user.name ?? "Account")}
                </span>
                <span className="text-[9px] opacity-60">▼</span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto z-20 mt-2 w-48 rounded-xl border p-1 shadow-lg bg-white border-line dark:bg-[#0b0d12] dark:border-border-dark">
                    <div className="flex items-center gap-2 px-3 py-2">
                      {avatar(32)}
                      <div className="min-w-0">
                        {user.name ? (
                          <div className="truncate text-[13px] font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
                            {user.name}
                          </div>
                        ) : null}
                        {user.username ? (
                          <div className="truncate text-[12px] text-[#64748b] dark:text-[#7c8696]">
                            @{user.username}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="my-1 border-t border-[#eef1f5] dark:border-[#232a36]" />
                    <Link
                      href={`/${lang}/graphs`}
                      onClick={() => setUserMenuOpen(false)}
                      className={menuItemClass}
                    >
                      {t.auth.myGraphs}
                    </Link>
                    <div className="my-1 border-t border-[#eef1f5] dark:border-[#232a36]" />
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className={`${menuItemClass} text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:text-red-400`}
                      >
                        {t.auth.signOut}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form action={signInGitHub} className="shrink-0">
              <button type="submit" className={signInClass}>
                {t.auth.signIn}
              </button>
            </form>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="grid place-items-center h-8 w-8 rounded-full border border-line text-ink transition-colors hover:bg-black/[0.04] dark:border-border-dark dark:text-fg dark:hover:bg-surface-hover"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-3 top-[68px] z-50 rounded-2xl border p-2 shadow-xl sm:hidden bg-white border-line dark:bg-[#0b0d12] dark:border-border-dark">
            <div className="flex flex-col">
              <div onClick={() => setMenuOpen(false)}>{docsLink("w-full")}</div>
              <div onClick={() => setMenuOpen(false)} className="mt-1">
                {starsLink("w-full justify-center")}
              </div>

              <div className="my-2 border-t border-line dark:border-border-dark" />

              {/* Languages */}
              <div className="grid grid-cols-2 gap-1">
                {locales.map((locale) => {
                  const active = locale === lang;
                  return (
                    <Link
                      key={locale}
                      href={getRedirectPath(locale)}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        active
                          ? "bg-slate-100 text-brand dark:bg-surface-active dark:text-fg"
                          : "text-ink-soft hover:bg-slate-50 hover:text-ink dark:text-muted dark:hover:bg-surface-hover dark:hover:text-fg"
                      }`}
                    >
                      <span>{LANGUAGE_NAMES[locale] ?? locale.toUpperCase()}</span>
                      {active && <span className="text-[10px]">✓</span>}
                    </Link>
                  );
                })}
              </div>

              <div className="my-2 border-t border-line dark:border-border-dark" />

              {/* Auth + CTA */}
              <Link
                href={`/${lang}/app`}
                onClick={() => setMenuOpen(false)}
                className={`${ctaClass} text-center`}
              >
                {t.getStarted}
              </Link>

              {user ? (
                <>
                  <div className="mt-1 flex items-center gap-2 px-3 py-2">
                    {avatar(28)}
                    <div className="min-w-0">
                      {user.name ? (
                        <div className="truncate text-[13px] font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
                          {user.name}
                        </div>
                      ) : null}
                      {user.username ? (
                        <div className="truncate text-[12px] text-[#64748b] dark:text-[#7c8696]">
                          @{user.username}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div onClick={() => setMenuOpen(false)}>
                    <Link
                      href={`/${lang}/graphs`}
                      className={`${menuItemClass} w-full`}
                    >
                      {t.auth.myGraphs}
                    </Link>
                  </div>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className={`${menuItemClass} text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400`}
                    >
                      {t.auth.signOut}
                    </button>
                  </form>
                </>
              ) : (
                <form action={signInGitHub} className="mt-1">
                  <button type="submit" className={`${signInClass} w-full`}>
                    {t.auth.signIn}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
