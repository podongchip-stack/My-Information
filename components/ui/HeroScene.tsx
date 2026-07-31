"use client";

import dynamic from "next/dynamic";
import { useCallback, useSyncExternalStore } from "react";

// three는 클라이언트 전용 — SSR에서 제외하고 지연 로드한다
const HeroSceneCanvas = dynamic(() => import("./HeroSceneCanvas"), {
  ssr: false,
});

/**
 * 히어로 배경 3D — 모션 축소 설정이면 아예 렌더링하지 않는다.
 * 이펙트 내 동기 setState 린트를 피해 외부 스토어 구독으로 읽는다.
 */
export default function HeroScene() {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const enabled = useSyncExternalStore(
    subscribe,
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <HeroSceneCanvas />
    </div>
  );
}
