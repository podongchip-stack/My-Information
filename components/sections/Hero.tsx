"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

// framer-motion의 Transition['ease']는 가변 number[]를 받으므로 as const를 쓰지 않는다
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const reduced = useReducedMotion();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-svh flex-col justify-center px-6 pt-24 pb-20"
    >
      <div className="mx-auto w-full max-w-5xl">
        <motion.p
          {...rise(0)}
          className="font-mono text-xs tracking-[0.28em] text-accent"
        >
          {ui.hero.role}
        </motion.p>

        <motion.h1
          {...rise(0.08)}
          className="mt-7 text-[clamp(2.75rem,9vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.03em]"
        >
          {ui.hero.headline.map((line, i) => (
            <span key={line} className="block">
              {i === ui.hero.headline.length - 1 ? (
                <span className="text-accent">{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
        >
          {ui.hero.tagline}
        </motion.p>

        <motion.div {...rise(0.24)} className="mt-11 flex flex-wrap gap-3">
          <Link
            href={`/${lang}#work`}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
          >
            {ui.hero.ctaWork}
          </Link>
          <Link
            href={`/${lang}#contact`}
            className="rounded-full border border-line-strong px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {ui.hero.ctaContact}
          </Link>
        </motion.div>
      </div>

      <motion.div
        {...(reduced
          ? {}
          : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 1.1, duration: 0.8 },
            })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-faint"
      >
        {ui.hero.scroll} ↓
      </motion.div>
    </section>
  );
}
