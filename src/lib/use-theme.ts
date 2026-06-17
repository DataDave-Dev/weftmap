"use client";

import { useSyncExternalStore, useEffect } from "react";
import { usePathname } from "next/navigation";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
}

/** Tracks whether the `dark` class is set on <html>, reactively. */
export function useIsDark() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      const d = theme
        ? theme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", d);
    } catch (e) {
      console.error(e);
    }
  }, [pathname]);

  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}
