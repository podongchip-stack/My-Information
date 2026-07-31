import Link from "next/link";
import BrandIcon, { type BrandName } from "@/components/ui/BrandIcon";
import HeroScene from "@/components/ui/HeroScene";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";
import { getUI } from "@/lib/content/ui";

const EMAIL = "podongchip@gmail.com";

const SOCIALS: { label: string; href: string; icon: BrandName }[] = [
  { label: "GitHub", href: "https://github.com/podongchip-stack", icon: "github" },
  {
    label: "Hugging Face",
    href: "https://huggingface.co/podongchip",
    icon: "huggingface",
  },
  { label: "Kaggle", href: "https://www.kaggle.com/podongchip", icon: "kaggle" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@포테이송",
    icon: "youtube",
  },
];

/**
 * 첫 화면 — 뷰포트를 가득 채우는 인트로.
 * 가운데 정체성 블록, 하단에 main 줄기의 시작과 포털 버튼들이 자리한다.
 */
export default function Hero({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const other = LANGS.find((l) => l !== lang)!;

  return (
    <section className="relative flex min-h-svh flex-col px-6 text-center">
      {/* 배경 3D git 그래프 — 마우스를 따라 기울고 천천히 돈다 */}
      <HeroScene />

      <Link
        href={`/${other}`}
        aria-label={ui.hero.switchLang}
        className="absolute top-6 right-0 z-10 inline-flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 font-mono text-xs text-faint transition-colors hover:border-accent hover:text-foreground"
      >
        <span className="text-foreground">{LANG_LABEL[lang]}</span>
        <span aria-hidden>/</span>
        <span>{LANG_LABEL[other]}</span>
      </Link>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {ui.hero.name}
        </h1>

        <p className="mt-5 text-lg font-medium sm:text-xl">
          {ui.hero.role.split("·").map((part, i) => (
            <span key={part}>
              {i > 0 && <span className="text-accent"> · </span>}
              {part.trim()}
            </span>
          ))}
        </p>
        <p className="mt-2 text-sm text-faint">{ui.hero.affiliation}</p>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-balance text-muted">
          {ui.hero.claim}
        </p>

        <a
          href={`mailto:${EMAIL}`}
          className="mt-8 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:opacity-85 motion-safe:hover:-translate-y-0.5"
        >
          {EMAIL}
        </a>
      </div>

      {/* main 줄기의 시작 — 첫 커밋 점이 아래 콘텐츠로 흘러내린다 */}
      <div aria-hidden className="relative z-10 flex flex-col items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-background" />
        <span className="mt-1 h-10 w-0.5 bg-accent-dim sm:h-14" />
      </div>

      {/* 포털 버튼 — 첫 화면 제일 아래 */}
      <ul className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 pt-6 pb-8">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line-strong py-1.5 pr-3.5 pl-1.5 text-sm text-muted transition-all duration-200 hover:border-accent hover:text-foreground motion-safe:hover:-translate-y-0.5"
            >
              <BrandIcon name={s.icon} />
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
