"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export default function CountUp({
  to,
  duration = 1400,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  // 모션을 줄이라는 설정이면 애니메이션 없이 최종값을 바로 보여준다
  const shown = reduced ? to : value;

  // 최종 숫자로 폭을 미리 잡아둔다. 자릿수가 늘 때마다 레이아웃이 밀리면
  // 스크롤 앵커링과 충돌해 화면이 덜덜거린다.
  return (
    <span
      ref={ref}
      className={`relative inline-block tabular-nums whitespace-nowrap ${className}`}
    >
      <span className="invisible" aria-hidden>
        {to.toLocaleString()}
      </span>
      <span className="absolute inset-0">{shown.toLocaleString()}</span>
    </span>
  );
}
