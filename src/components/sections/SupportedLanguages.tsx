import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { LANDING_LANGUAGES } from "@/lib/landing-languages";

type Row = { name: string; kind: string; detail: string };

type Props = {
  title: string;
  subtitle: string;
  rows: Row[];
  lang: string;
};

// Row labels are localized ("جافا (Java)"), so match on the English name being
// present rather than on equality.
function landingIdFor(rowName: string): string | undefined {
  return LANDING_LANGUAGES.find((l) => rowName.includes(l.name))?.id;
}

export default function SupportedLanguages({
  title,
  subtitle,
  rows,
  lang,
}: Props) {
  return (
    <section
      id="languages"
      className="mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16"
    >
      <SectionHeading index="05" title={title} />
      <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
        {subtitle}
      </p>

      <ul className="mt-10 border-t border-line dark:border-border-dark">
        {rows.map((row) => {
          const id = landingIdFor(row.name);
          return (
          <li
            key={row.name}
            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line dark:border-border-dark py-5 transition-colors hover:bg-slate-50 dark:hover:bg-surface-hover sm:grid-cols-[200px_140px_1fr]"
          >
            {/* Each row links to its landing page: the homepage is the
                strongest internal link source the site has. */}
            {id ? (
              <Link
                href={`/${lang}/call-graph/${id}`}
                className="font-mono text-base text-ink dark:text-fg underline-offset-4 transition-colors group-hover:text-brand group-hover:underline dark:group-hover:text-brand-dark"
              >
                {row.name}
              </Link>
            ) : (
              <span className="font-mono text-base text-ink dark:text-fg transition-colors group-hover:text-brand dark:group-hover:text-brand-dark">
                {row.name}
              </span>
            )}
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#64748b] dark:text-[#7c8696]">
              {row.kind}
            </span>
            <span className="col-span-2 text-[14px] text-[#475569] dark:text-[#9aa6b8] sm:col-span-1">
              {row.detail}
            </span>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
