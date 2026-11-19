"use client";

/**
 * NavigationProgress
 *
 * Shows a slim violet progress bar at the top of the page during navigation.
 * Uses the Next.js App Router's built-in navigation events.
 * No external library needed — pure CSS animation.
 *
 * This solves the "did my click do anything?" problem:
 * the bar appears instantly on click, before the server even responds.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const widthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPath = useRef(pathname + searchParams.toString());

  // Detect route change start by watching for click on any <a> or <Link>
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#")) return;
      // Internal navigation — start the bar
      startProgress();
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Detect route change completion
  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    if (currentPath !== prevPath.current) {
      prevPath.current = currentPath;
      completeProgress();
    }
  }, [pathname, searchParams]);

  function startProgress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (widthTimerRef.current) clearInterval(widthTimerRef.current);

    setLoading(true);
    setWidth(5);

    // Slowly increment to 85% — simulates progress
    let w = 5;
    widthTimerRef.current = setInterval(() => {
      w += w < 30 ? 8 : w < 60 ? 4 : w < 85 ? 1 : 0;
      setWidth(Math.min(w, 85));
    }, 150);
  }

  function completeProgress() {
    if (widthTimerRef.current) clearInterval(widthTimerRef.current);
    setWidth(100);
    timerRef.current = setTimeout(() => {
      setLoading(false);
      setWidth(0);
    }, 300);
  }

  if (!loading && width === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] transition-all duration-200 ease-out"
      style={{
        width: `${width}%`,
        background: "linear-gradient(90deg, #7C3AED, #06b6d4)",
        boxShadow: "0 0 8px #7C3AED80",
        opacity: loading || width === 100 ? 1 : 0,
      }}
    />
  );
}
