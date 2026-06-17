"use client";

import type { ReactNode, MouseEvent } from "react";

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
      className="max-w-[1200px] mx-auto px-6 pt-28 pb-[136px] max-[620px]:pt-16 max-[620px]:pb-[88px]"
    >
      <h2 className="text-[clamp(1.9rem,3.2vw,2.75rem)] font-bold tracking-[-0.01em] text-center mb-14">
        {heading}
      </h2>

      <div className="grid grid-cols-4 auto-rows-[minmax(190px,auto)] gap-5 max-lg:grid-cols-2 max-[620px]:grid-cols-1">
        {features.map((feature, i) => {
          const tile = TILES[i] ?? {};
          const big = "big" in tile && tile.big;
          const wide = "span" in tile;
          return (
            <article
              key={feature.title}
              onMouseMove={trackPointer}
              className={`js-reveal spotlight rounded-2xl border border-white/[0.08] bg-[#13151b] px-[30px] py-[34px] transition-transform hover:-translate-y-[3px] ${
                big ? "flex flex-col" : ""
              } ${wide ? tile.span : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-[#e6e9ef] mb-[18px] ${
                  big ? "w-[52px] h-[52px]" : "w-11 h-11"
                }`}
              >
                {ICONS[i]}
              </span>
              <h3
                className={`font-semibold mb-2.5 ${big ? "text-2xl" : "text-[19px]"}`}
              >
                {feature.title}
              </h3>
              <p className="text-[15px] leading-[1.65] text-muted">
                {feature.desc}
              </p>

              {big && (
                <div className="mt-auto pt-7">
                  <div className="flex flex-wrap gap-2">
                    {["Python", "JavaScript", "TypeScript", "Go", "Rust"].map((l) => (
                      <span
                        key={l}
                        className="px-2.5 py-1 rounded-md border border-white/15 bg-white/[0.05] font-mono text-xs text-[#cbd5e1]"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
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
