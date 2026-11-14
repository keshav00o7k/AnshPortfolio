"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const ScrollManager = () => {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  // 1. Force scroll restoration to manual and scroll to top on every refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      // Always scroll directly to the very top on reload/refresh
      window.scrollTo(0, 0);

      // Cleanly reset any trailing hash in the address bar on refresh
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  // 2. On route / page changes: scroll to top immediately (unless a hash anchor exists)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const target = document.getElementById(id);
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: "smooth" });
          }, 100);
          return;
        }
      }

      // No hash: scroll directly to top on page change
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

