"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

// lottie-react는 브라우저(DOM) 전용 → SSR 비활성화
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LottieGreeting({ label }: { label: string }) {
  const [data, setData] = useState<object | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let active = true;
    fetch("/lottie/greeting.json")
      .then((r) => r.json())
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!data) return null;

  return (
    <Lottie
      animationData={data}
      loop={!reduced}
      autoplay={!reduced}
      className="w-44 sm:w-52"
      aria-label={label}
    />
  );
}
