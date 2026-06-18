import type { ReactNode } from "react";
import SectionHeading from "./SectionHeading";

const svgProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: ReactNode[] = [
  <svg key="paste" {...svgProps}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>,
  <svg key="parse" {...svgProps}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="12" r="2.2" />
    <path d="M8 6h4a4 4 0 0 1 4 4v0M8 18h4a4 4 0 0 0 4-4v0" />
  </svg>,
  <svg key="graph" {...svgProps}>
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="18" r="2.4" />
    <circle cx="12" cy="5" r="2.4" />
    <path d="M11 7 7 16M13 7l4 9" />
  </svg>,
];

type Step = { title: string; desc: string };

export default function HowItWorks({
  heading,
  steps,
}: {
  heading: string;
  steps: Step[];
}) {
  return (
    <section
      id="how"
      className="mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16"
    >
      <SectionHeading index="02" title={heading} />

      {/* Hairline grid: gap-px over a bordered container draws crisp rules between cells. */}
      <ol className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line dark:border-border-dark bg-line dark:bg-border-dark shadow-[0_1px_3px_rgba(15,23,42,0.06)] max-[760px]:grid-cols-1">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="js-reveal group flex flex-col bg-white dark:bg-surface p-8 transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-surface-hover"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl tracking-tight text-slate-300 transition-colors group-hover:text-brand dark:group-hover:text-brand-dark">
                {`0${i + 1}`}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line dark:border-border-dark bg-slate-100 dark:bg-surface-active text-brand dark:text-brand-dark-hover transition-colors group-hover:border-indigo-200 dark:group-hover:border-brand-dark">
                {ICONS[i]}
              </span>
            </div>
            <h3 className="mt-7 text-lg font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
              {step.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
              {step.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
