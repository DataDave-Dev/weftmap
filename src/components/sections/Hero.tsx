"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroPreview from "./HeroPreview";

gsap.registerPlugin(useGSAP);

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Go", "Rust", "SQL"];

type Props = {
  badge: string;
  phrase: string;
  sub: string;
  getStarted: string;
  learnMore: string;
  supports: string;
  appHref: string;
};

export default function Hero({
  badge,
  phrase,
  sub,
  getStarted,
  learnMore,
  supports,
  appHref,
}: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.7 },
        });
        tl.from(".js-badge", { y: 16, opacity: 0, duration: 0.5 })
          .from(".js-phrase", { y: 24, opacity: 0 }, "-=0.2")
          .from(".js-sub", { y: 18, opacity: 0 }, "-=0.45")
          .from(".js-actions", { y: 16, opacity: 0 }, "-=0.4")
          .from(".js-chips > *", { y: 12, opacity: 0, stagger: 0.06 }, "-=0.3")
          .from(".js-card", { y: 24, opacity: 0 }, "-=0.7")
          .from(".js-connector", { y: 8, opacity: 0, duration: 0.4 }, "-=0.25")
          .from(".js-node-main", { y: 12, opacity: 0, duration: 0.45 }, "-=0.2")
          .from(".js-edge", { opacity: 0, duration: 0.4 }, "-=0.05")
          .from(".js-node-child", { y: 12, opacity: 0, stagger: 0.12 }, "-=0.1");
      });
      // Revert on cleanup so a Strict Mode remount doesn't capture the hidden
      // (opacity: 0) state as the target and leave elements invisible.
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative grid place-items-center min-h-[calc(100vh-65px)] p-6 overflow-hidden"
    >
      {/* Soft brand-tinted light from the top. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[70%] pointer-events-none z-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(79,70,229,0.12),transparent_72%)]"
      />

      <div className="relative z-10 w-full max-w-[1200px] grid grid-cols-[1.1fr_0.9fr] items-center gap-16 max-[860px]:grid-cols-1 max-[860px]:gap-9 max-[860px]:justify-items-center">
        <div className="flex flex-col items-start max-[860px]:items-center max-[860px]:text-center">
          <div className="js-badge mb-6 inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-3.5 py-1.5 shadow-sm max-[860px]:mx-auto">
            <span className="h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <span className="text-[12.5px] font-medium text-[#475569] dark:text-[#9aa6b8]">
              {badge}
            </span>
          </div>

          <h1 className="js-phrase max-w-[16ch] text-[clamp(2.4rem,4.6vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#0f172a] dark:text-[#e6e9ef]">
            {phrase}
          </h1>
          <p className="js-sub mt-5 max-w-[46ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-[#475569] dark:text-[#9aa6b8]">
            {sub}
          </p>

          <div className="js-actions flex flex-wrap gap-3 mt-8">
            <Link
              href={appHref}
              className="rounded-full bg-[#4f46e5] dark:bg-[#6366f1] px-7 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.6)] transition hover:-translate-y-px hover:bg-[#4338ca]"
            >
              {getStarted}
            </Link>
            <Link
              href="#about"
              className="rounded-full border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-7 py-3.5 text-base font-semibold text-[#0f172a] dark:text-[#e6e9ef] transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50"
            >
              {learnMore}
            </Link>
          </div>

          <div className="js-chips flex items-center flex-wrap gap-2 mt-8">
            <span className="text-[12.5px] text-[#64748b] dark:text-[#7c8696] mr-0.5">{supports}:</span>
            {LANGUAGES.map((language) => (
              <span
                key={language}
                className="rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-2.5 py-1 font-mono text-xs text-[#475569] dark:text-[#9aa6b8]"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
