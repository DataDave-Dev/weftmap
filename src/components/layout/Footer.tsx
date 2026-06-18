import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { REPO_URL as REPO } from "@/lib/constants";
import Logo from "./Logo";

type Props = {
  lang: Locale;
  tagline: string;
  license: string;
  contribute: string;
  product: string;
  resources: string;
  footerNote: string;
};

function ColHeading({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
      {children}
    </h3>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: string;
}) {
  const className =
    "group/link w-fit inline-flex items-center gap-1.5 text-sm text-[#475569] dark:text-[#9aa6b8] hover:text-[#4f46e5] transition-colors";
  const inner = (
    <>
      <span className="h-px w-0 bg-current transition-all duration-300 group-hover/link:w-3" />
      {children}
    </>
  );
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

export default function Footer({
  lang,
  tagline,
  license,
  contribute,
  product,
  resources,
  footerNote,
}: Props) {
  const t = getDictionary(lang);
  return (
    <footer className="relative isolate overflow-hidden bg-[#f6f7f9] dark:bg-[#0b0d12]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-8 gap-y-12 px-6 pb-44 pt-20 md:grid-cols-[1.7fr_1fr_1fr]">
        {/* Brand */}
        <div className="col-span-2 max-w-sm md:col-span-1">
          <Link
            href={`/${lang}`}
            className="flex w-fit items-center gap-2.5 text-2xl font-bold tracking-[0.02em] text-[#0f172a] dark:text-[#e6e9ef]"
          >
            <Logo className="h-7 w-7 text-[#0f172a] dark:text-[#e6e9ef]" />
            <span>Weftmap</span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-[#475569] dark:text-[#9aa6b8]">
            {tagline}
          </p>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="mt-7 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] text-[#475569] dark:text-[#9aa6b8] transition-all hover:-translate-y-0.5 hover:border-[#c7d2fe] hover:text-[#4f46e5]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.83.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
            </svg>
          </a>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-4">
          <ColHeading>{product}</ColHeading>
          <FooterLink href={`/${lang}/app`}>{t.getStarted}</FooterLink>
          <FooterLink href={`/${lang}/docs`}>Docs</FooterLink>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-4">
          <ColHeading>{resources}</ColHeading>
          <FooterLink href={REPO} external>
            GitHub
          </FooterLink>
          <FooterLink href={`${REPO}/blob/main/LICENSE`} external>
            {license}
          </FooterLink>
          <FooterLink href={`${REPO}/blob/main/CONTRIBUTING.md`} external>
            {contribute}
          </FooterLink>
        </div>
      </div>

      {/* Oversized brand wordmark fading into the background */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] -z-10 select-none whitespace-nowrap bg-gradient-to-t from-black/0 via-black/[0.03] to-black/[0.06] dark:from-white/0 dark:via-white/[0.03] dark:to-white/[0.07] bg-clip-text text-center text-[20vw] font-bold leading-none tracking-tighter text-transparent"
      >
        Weftmap
      </span>

      <div className="relative border-t border-[#e2e8f0] dark:border-[#232a36] bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-[#64748b] dark:text-[#7c8696] sm:flex-row">
          <span>© 2026 DataDave-Dev · {footerNote}</span>
          <span className="font-mono tracking-wider">MIT</span>
        </div>
      </div>
    </footer>
  );
}
