"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 스크롤 리빌 — 뷰포트에 들어오면 아래에서 떠오른다.
 * prefers-reduced-motion이면 전역 CSS가 트랜지션을 꺼서 즉시 나타나고,
 * JS가 없는 환경은 layout의 noscript 스타일이 [data-reveal]을 강제로 보인다.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** 트랜지션 지연(ms) — 나란한 요소를 시차로 띄울 때 */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
