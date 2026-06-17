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
      className="relative isolate flex min-h-screen items-center overflow-hidden"
    >
      {/* Soft glow keeps the band from reading as a flat fill. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[75%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(198,206,219,0.10),transparent)] blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-[1100px] px-6 py-28 max-[620px]:py-16">
        <SectionHeading index="02" title={heading} />

        {/* Hairline grid: gap-px over a bordered container draws crisp rules between cells. */}
        <ol className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 max-[760px]:grid-cols-1">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="js-reveal group flex flex-col bg-[#0c0e14] p-8 transition-colors duration-300 hover:bg-[#12151c]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl tracking-tight text-muted/60 transition-colors group-hover:text-accent">
                  {`0${i + 1}`}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] text-[#e6e9ef] transition-colors group-hover:border-white/30">
                  {ICONS[i]}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.65] text-muted">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
