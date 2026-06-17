"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Reveals any element tagged `.js-reveal` as it scrolls into view.
// One global instance handles every section; tag the elements you want staggered.
export default function ScrollReveal() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hide only inside the no-preference branch so reduced-motion users (and a
      // JS failure) keep the elements visible at their natural CSS state.
      const items = gsap.utils.toArray<HTMLElement>(".js-reveal");
      if (items.length > 0) {
        gsap.set(items, { opacity: 0, y: 24 });
        ScrollTrigger.batch(items, {
          start: "top 85%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.1,
              overwrite: true,
            }),
        });
      }

      // Connectors tagged `.js-draw` draw left-to-right as they enter view.
      const lines = gsap.utils.toArray<HTMLElement>(".js-draw");
      if (lines.length > 0) {
        gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });
        ScrollTrigger.batch(lines, {
          start: "top 80%",
          onEnter: (batch) =>
            gsap.to(batch, {
              scaleX: 1,
              duration: 0.8,
              ease: "power2.out",
              overwrite: true,
            }),
        });
      }

      ScrollTrigger.refresh();
    });
    // Revert clears the inline hidden state and kills triggers on cleanup,
    // mirroring the Hero pattern so a Strict Mode remount can't strand elements.
    return () => mm.revert();
  });

  return null;
}
