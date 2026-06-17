"use client";

import type { ReactNode, MouseEvent } from "react";
import SectionHeading from "./SectionHeading";

function trackPointer(e: MouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  card.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: ReactNode[] = [
  <svg key="languages" {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>,
  <svg key="diagram" {...svgProps}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <circle cx="12" cy="5" r="2.5" />
    <path d="M11 7 7 16M13 7l4 9" />
  </svg>,
  <svg key="pluggable" {...svgProps}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>,
  <svg key="accurate" {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.5" />
  </svg>,
  <svg key="nosetup" {...svgProps}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </svg>,
  <svg key="opensource" {...svgProps}>
    <path d="m8 16-4-4 4-4M16 8l4 4-4 4M14 4l-4 16" />
  </svg>,
];

type Feature = { title: string; desc: string };

// Bento sizing per feature index: a large anchor tile + wide tiles + normals.
const TILES = [
  {
    span: "col-span-2 row-span-2 max-lg:row-span-1 max-[620px]:col-span-1",
    big: true,
  },
  { span: "col-span-2 max-[620px]:col-span-1" },
  {},
  {},
  { span: "col-span-2 max-[620px]:col-span-1" },
  { span: "col-span-2 max-[620px]:col-span-1" },
] as const;

export default function Features({
  heading,
  features,
  moreLanguagesSoon,
}: {
  heading: string;
  features: Feature[];
  moreLanguagesSoon: string;
}) {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-[1200px] px-6 py-24 max-[620px]:py-16"
    >
      <SectionHeading index="03" title={heading} />

      <div className="mt-12 grid grid-cols-4 auto-rows-[minmax(190px,auto)] gap-5 max-lg:grid-cols-2 max-[620px]:grid-cols-1">
        {features.map((feature, i) => {
          const tile = TILES[i] ?? {};
          const big = "big" in tile && tile.big;
          const wide = "span" in tile;
          return (
            <article
              key={feature.title}
              onMouseMove={trackPointer}
              className={`js-reveal rounded-2xl border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-[30px] py-[34px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_30px_-12px_rgba(15,23,42,0.18)] ${big ? "flex flex-col" : ""
                } ${wide ? tile.span : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center rounded-xl border border-[#e2e8f0] dark:border-[#232a36] bg-[#f1f5f9] dark:bg-[#1a1f29] text-[#4f46e5] dark:text-[#a5b4fc] mb-[18px] ${big ? "w-[52px] h-[52px]" : "w-11 h-11"
                  }`}
              >
                {ICONS[i]}
              </span>
              <h3
                className={`font-semibold mb-2.5 text-[#0f172a] dark:text-[#e6e9ef] ${big ? "text-2xl" : "text-[19px]"}`}
              >
                {feature.title}
              </h3>
              <p className="text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
                {feature.desc}
              </p>

              {big && (
                <div className="mt-auto pt-7">
                  <div className="flex flex-wrap gap-2">
                    {["Python", "JavaScript", "TypeScript", "Go", "Rust", "SQL"].map((l) => (
                      <span
                        key={l}
                        className="px-2.5 py-1 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c] font-mono text-xs text-[#475569] dark:text-[#9aa6b8]"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#64748b] dark:text-[#7c8696]">
                    <span className="text-base leading-none">+</span>
                    {moreLanguagesSoon}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
