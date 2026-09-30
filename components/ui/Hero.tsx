import Link from "next/link";
import NeuralCircuit from "@/components/ui/NeuralCircuit";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";
import { getUI } from "@/lib/content/ui";
import { EMAIL, SOCIALS } from "@/lib/links";

const LAB_URL = "https://play-ground-attendance.vercel.app/";

/** 히어로 옆에 바로 두는 링크 — 나머지 채널은 푸터에 모은다 */
const HERO_LINKS = SOCIALS.filter((s) =>
  ["GitHub", "Hugging Face"].includes(s.label)
);

const chip =
  "inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm text-muted transition-colors hover:border-accent hover:text-foreground";

/** 상단 바(이름·역할, 테마·언어 전환) + 소속·연락 링크 */
export default function Hero({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const other = LANGS.find((l) => l !== lang)!;

  return (
    <>
      <header className="flex h-16 items-center justify-between gap-3">
        <p className="text-sm leading-snug font-semibold">
          {ui.hero.name}
          <span className="block text-xs font-normal text-faint sm:ml-2 sm:inline sm:text-sm">
            {ui.hero.role}
          </span>
        </p>
        <div className="flex gap-1.5">
          <ThemeToggle label={ui.hero.theme} />
          <Link
            href={`/${other}`}
            aria-label={ui.hero.switchLang}
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-line px-3 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            {LANG_LABEL[other]}
          </Link>
        </div>
      </header>

      <NeuralCircuit className="mt-4 h-[320px] md:mt-8 md:h-[460px]" />

      <section className="pt-6 pb-10 md:pt-10 md:pb-14">
        <p className="text-[0.9375rem] text-muted">
          {ui.hero.affiliation}
          <span aria-hidden> · </span>
          <a
            href={LAB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-accent"
          >
            {ui.hero.lab}
            <span aria-hidden> ↗</span>
          </a>
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 text-sm font-semibold text-on-accent transition-[filter] hover:brightness-95"
          >
            {ui.hero.email}
          </a>
          {HERO_LINKS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={chip}
            >
              {s.label}
              <span aria-hidden>&nbsp;↗</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
