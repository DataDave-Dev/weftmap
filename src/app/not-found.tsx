"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import "@fontsource-variable/lexend";
import "./globals.css";

gsap.registerPlugin(useGSAP);

// not-found.tsx can't receive route params — derive the locale from the URL.
// No app/layout.tsx exists, but Next synthesizes a default <html>/<body>, so this
// renders only the content (a second <html> here breaks hydration).
function useLocale(): Locale {
  const segment = usePathname()?.split("/")[1] ?? "";
  return isLocale(segment) ? segment : defaultLocale;
}

export default function NotFound() {
  const lang = useLocale();
  const t = getDictionary(lang);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.6 },
        });
        tl.from(".js-node", { y: 14, opacity: 0, stagger: 0.1 })
          .from(".js-edge", { opacity: 0, duration: 0.4 }, "-=0.2")
          .from(".js-num", { y: 22, opacity: 0, duration: 0.7 }, "-=0.15")
          .from(".js-title", { y: 16, opacity: 0 }, "-=0.45")
          .from(".js-desc", { y: 14, opacity: 0 }, "-=0.45")
          .from(".js-actions", { y: 14, opacity: 0 }, "-=0.4");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <main
        ref={root}
        className="relative grid place-items-center min-h-screen p-6 overflow-hidden"
      >
          {/* Overhead light, mirroring the hero. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[72%] pointer-events-none z-0 bg-[radial-gradient(62%_78%_at_50%_-8%,rgba(79,70,229,0.12),rgba(79,70,229,0.05)_44%,transparent_74%)]"
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-[44ch]">
            {/* A call graph whose route to this page is severed — the page got
                lost in the graph. */}
            <svg
              className="w-[min(420px,82vw)] h-auto mb-2"
              viewBox="0 0 420 120"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="nf-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
                </marker>
              </defs>

              {/* Working routes — solid flowing edges. */}
              <path
                className="edge-flow js-edge"
                d="M210 40 C 150 64, 110 70, 73 86"
                markerEnd="url(#nf-arrow)"
              />
              <path
                className="edge-flow js-edge"
                d="M210 40 C 270 64, 310 70, 347 86"
                markerEnd="url(#nf-arrow)"
              />
              {/* Severed route — dashed edge that stops short. */}
              <path
                className="js-edge"
                d="M210 42 V 74"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <g
                className="js-edge"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M204 80 L216 92" />
                <path d="M216 80 L204 92" />
              </g>

              <g className="js-node">
                <rect
                  className="fill-[#eef2ff] stroke-[#4f46e5]"
                  x="150"
                  y="6"
                  width="120"
                  height="34"
                  rx="9"
                />
                <text
                  className="fill-[#0f172a] font-mono text-[13px]"
                  x="210"
                  y="23"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  router
                </text>
              </g>
              <g className="js-node">
                <rect
                  className="fill-white stroke-[#cbd5e1]"
                  x="14"
                  y="86"
                  width="118"
                  height="34"
                  rx="9"
                />
                <text
                  className="fill-[#0f172a] font-mono text-[13px]"
                  x="73"
                  y="103"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  home
                </text>
              </g>
              <g className="js-node">
                <rect
                  className="fill-white stroke-[#cbd5e1]"
                  x="288"
                  y="86"
                  width="118"
                  height="34"
                  rx="9"
                />
                <text
                  className="fill-[#0f172a] font-mono text-[13px]"
                  x="347"
                  y="103"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  app
                </text>
              </g>
            </svg>

            <p className="js-num text-[#0f172a] dark:text-[#e6e9ef] font-extrabold leading-[0.9] tracking-[-0.04em] text-[clamp(5rem,17vw,11rem)]">
              404
            </p>

            <h1 className="js-title mt-3 text-[#0f172a] dark:text-[#e6e9ef] font-bold leading-tight tracking-[-0.02em] text-[clamp(1.5rem,3.2vw,2.25rem)]">
              {t.notFoundTitle}
            </h1>

            <p className="js-desc mt-3 text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed text-[#475569] dark:text-[#9aa6b8]">
              {t.notFoundDesc}
            </p>

            <div className="js-actions flex flex-wrap justify-center gap-4 mt-9">
              <Link
                href={`/${lang}`}
                className="bg-[#4f46e5] dark:bg-[#6366f1] text-white rounded-full px-8 py-3.5 text-base font-semibold cursor-pointer transition hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px]"
              >
                {t.notFoundHome}
              </Link>
              <Link
                href={`/${lang}/app`}
                className="rounded-full px-8 py-3.5 text-base font-semibold cursor-pointer transition border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] text-[#0f172a] dark:text-[#e6e9ef] hover:-translate-y-px hover:bg-slate-50 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px]"
              >
                {t.notFoundApp}
              </Link>
            </div>
          </div>
        </main>
    </>
  );
}
