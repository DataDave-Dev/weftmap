"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroPreview from "./HeroPreview";

gsap.registerPlugin(useGSAP);

const LANGUAGES = ["Python", "JavaScript", "TypeScript"];

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
      {/* Soft overhead light spilling down onto the hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[72%] pointer-events-none z-0 bg-[radial-gradient(62%_78%_at_50%_-8%,rgba(255,255,255,0.19),rgba(255,255,255,0.07)_44%,transparent_74%)]"
      />

      <div
        aria-hidden="true"
        className="absolute top-[38%] left-1/2 w-[min(900px,90vw)] h-[600px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),rgba(255,255,255,0.03)_38%,transparent_68%)]"
      />

      <div className="relative z-10 w-full max-w-[1200px] grid grid-cols-[1.1fr_0.9fr] items-center gap-16 max-[860px]:grid-cols-1 max-[860px]:gap-9 max-[860px]:justify-items-center">
        <div className="flex flex-col items-start max-[860px]:items-center max-[860px]:text-center">
          <span className="js-badge inline-flex items-center gap-2 mb-[22px] px-3.5 py-1.5 rounded-full border border-white/[0.14] bg-white/[0.04] text-[12.5px] font-medium text-[#cbd5e1]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#e6e9ef] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            {badge}
          </span>

          <h1 className="js-phrase metallic max-w-[18ch] text-[clamp(2.2rem,4.2vw,4rem)] font-extrabold leading-[1.1] pb-[0.12em] tracking-[-0.02em]">
            {phrase}
          </h1>
          <p className="js-sub mt-4 max-w-[44ch] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-muted">
            {sub}
          </p>

          <div className="js-actions flex flex-wrap gap-4 mt-8">
            <Link
              href={appHref}
              className="metallic-fill rounded-full px-8 py-3.5 text-base font-semibold cursor-pointer transition hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px]"
            >
              {getStarted}
            </Link>
            <Link
              href="#about"
              className="rounded-full px-8 py-3.5 text-base font-semibold cursor-pointer transition border border-white/25 text-[#e6e9ef] hover:-translate-y-px hover:bg-white/[0.08] hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px]"
            >
              {learnMore}
            </Link>
          </div>

          <div className="js-chips flex items-center flex-wrap gap-2 mt-7">
            <span className="text-[12.5px] text-muted mr-0.5">{supports}:</span>
            {LANGUAGES.map((language) => (
              <span
                key={language}
                className="px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.03] font-mono text-xs text-[#cbd5e1]"
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
