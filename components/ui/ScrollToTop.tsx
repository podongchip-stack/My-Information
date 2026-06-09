"use client";

import { useEffect } from "react";

// 진입 시 브라우저 스크롤 복원을 끄고, 남아 있는 #해시를 지운 뒤 최상단에서 시작.
// (네비게이션 클릭은 마운트 이후 동작이라 영향 없음)
export default function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // 이전에 클릭한 #projects 등의 해시가 남아 점프하는 것을 방지
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
