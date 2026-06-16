import Link from "next/link";
import type { Locale } from "@/i18n/config";

const REPO = "https://github.com/DataDave-Dev/weftmap";

type Props = {
  lang: Locale;
  tagline: string;
  license: string;
  contribute: string;
  footerNote: string;
};

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-fit text-muted hover:text-fg transition-colors"
    >
      {children}
    </a>
  );
}

export default function Footer({
  lang,
  tagline,
  license,
  contribute,
  footerNote,
}: Props) {
  return (
    <footer className="relative bg-black border-t border-white/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 py-14 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link
            href={`/${lang}`}
            className="metallic text-xl font-bold tracking-[0.02em]"
          >
            Weftmap
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted">{tagline}</p>
          <p className="mt-4 text-[13px] text-muted/70">{footerNote}</p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit flex items-center gap-2 text-muted hover:text-fg transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.83.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
            </svg>
            GitHub
          </a>
          <ExternalLink href={`${REPO}/blob/main/LICENSE`}>
            {license}
          </ExternalLink>
          <ExternalLink href={`${REPO}/blob/main/CONTRIBUTING.md`}>
            {contribute}
          </ExternalLink>
        </nav>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted">
          <span>© 2026 DataDave-Dev</span>
          <span className="font-mono">MIT</span>
        </div>
      </div>
    </footer>
  );
}
