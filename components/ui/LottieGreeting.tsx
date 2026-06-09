"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// lottie-react는 브라우저(DOM) 전용 → SSR 비활성화
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LottieGreeting() {
  const [data, setData] = useState<object | null>(null);

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
      loop
      autoplay
      className="w-44 sm:w-52"
      aria-label="인사하는 귀여운 고양이 캐릭터"
    />
  );
}
