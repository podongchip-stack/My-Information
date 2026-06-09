"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Three.js Canvas는 SSR 비활성화 (브라우저 전용 WebGL)
const HeroCanvas = dynamic(() => import("@/components/ui/HeroCanvas"), {
  ssr: false,
});

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex h-screen items-center justify-center overflow-hidden"
    >
      {/* 화면 전체를 채우는 3D 신경망 배경 (흐름에서 빼내 글자 뒤에 깔리도록) */}
      <div className="absolute inset-0 z-0">
        <HeroCanvas />
      </div>

      {/* 가독성용 비네트 + 하단 블렌딩 (배경과 텍스트 사이) */}
      <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(9,9,9,0.65)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-b from-transparent to-background" />

      {/* 글자 뒤 은은한 음영 — 배경 발광에 글자가 묻히지 않도록 (구는 그대로 보임) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[6] h-80 w-[44rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(9,9,9,0.6)_0%,transparent_70%)] blur-2xl" />

      {/* 강조 문구 (가운데) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <p className="mb-5 text-base font-bold tracking-[0.3em] text-accent [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
          PORTFOLIO
        </p>

        <h1 className="whitespace-nowrap text-5xl font-black leading-[1.05] tracking-tight text-white [text-shadow:0_3px_20px_rgba(0,0,0,0.9)] sm:text-8xl md:text-9xl">
          DONG HYEON
        </h1>
        <p className="mt-8 max-w-2xl text-base font-bold text-foreground [text-shadow:0_2px_14px_rgba(0,0,0,0.9)] sm:text-xl">
          <span className="text-red-500">백엔드 </span>와{" "}
          <span className="text-red-500">AI </span>를 다루는 엔지니어,
          <br className="sm:hidden" /> 근데 이제{" "}
          <span className="text-red-500">하드웨어</span> 지식도 곁들인
          <span className="mt-3 block text-xs font-semibold text-foreground/85 sm:text-xl">
            전자공학전공 · 주니어 백엔드 개발자 · AI 엔지니어
          </span>
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#projects"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/30 transition-colors hover:bg-accent/90 sm:px-7 sm:py-3.5 sm:text-base"
          >
            프로젝트 보기
          </a>
          <a
            href="#contact"
            className="rounded-full border border-border-subtle bg-background/50 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-card-hover sm:px-7 sm:py-3.5 sm:text-base"
          >
            연락하기
          </a>
        </div>
      </motion.div>

      {/* 스크롤 안내 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-widest text-muted"
      >
        SCROLL ↓
      </motion.div>
    </section>
  );
}
