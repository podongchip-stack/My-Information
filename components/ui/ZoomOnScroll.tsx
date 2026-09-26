"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 화면에 들어오면서 0.92 → 1.0으로 커진다. 요소가 화면 높이의 60%만큼
 * 올라오면 원래 크기. 모션 줄이기 설정이면 처음부터 원래 크기다.
 */
export default function ZoomOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - el.getBoundingClientRect().top) / (vh * 0.6)));
      el.style.setProperty("--zoom", (0.92 + 0.08 * p).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`origin-top [scale:var(--zoom,1)] will-change-[scale] ${className}`}
    >
      {children}
    </div>
  );
}
