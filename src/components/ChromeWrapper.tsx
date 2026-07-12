"use client";

/**
 * ChromeWrapper
 *
 * Wraps the site chrome (Header / main / Footer / MobileBottomNav) and hides it
 * for embedding scenarios so that embedded views render only the tool itself:
 *
 *  - Any path under `/embed/...` (the embed wrapper pages) -> hide chrome.
 *    This is detected synchronously from `usePathname()` so there is no flash
 *    in the statically-exported HTML.
 *  - Any page loaded with `?embed=1` (the iframe content served from /tools/...)
 *    -> hide chrome. The query param is read on the client; for a static export
 *    the chrome is present in the initial HTML and removed before paint via a
 *    layout effect to minimise the visible flash.
 *
 * For all other routes the full site chrome is rendered exactly as before.
 */

import { useEffect, useState, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

// useLayoutEffect warns when run on the server; use an isomorphic variant.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ChromeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hideByParam, setHideByParam] = useState(false);

  // Synchronous check: embed wrapper pages always hide chrome (no flash).
  const isEmbedPath =
    !!pathname && pathname.startsWith("/embed/") && pathname !== "/embed";

  // Client-side check: hide chrome when ?embed=1 is present (iframe content).
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      setHideByParam(params.get("embed") === "1");
    } catch {
      // ignore
    }
  }, [pathname]);

  const hideChrome = isEmbedPath || hideByParam;

  if (hideChrome) {
    // Chrome-less shell: only the page content, no header/footer/nav.
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
