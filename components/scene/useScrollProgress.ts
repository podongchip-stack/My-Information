"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * 문서 전체 스크롤 진행도(0~1)를 ref로 돌려준다.
 *
 * 매 프레임 scrollHeight를 읽으면 레이아웃이 강제로 계산되므로,
 * 최대 스크롤 길이는 resize와 콘텐츠 변화 시점에만 다시 잰다.
 */
export function useScrollProgress(): RefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    let maxScroll = 1;

    const measure = () => {
      maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      update();
    };

    const update = () => {
      progress.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    measure();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);

    // 이미지·폰트 로드로 문서 높이가 바뀌는 경우를 잡는다
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  return progress;
}
