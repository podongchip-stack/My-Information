import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { casedWork, workBySlug, type Metric } from "@/data/work";
import { getUI } from "@/lib/content/ui";
import { LANGS, isLang, type Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    casedWork.map((item) => ({ lang, slug: item.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = workBySlug.get(slug);
  if (!isLang(lang) || !item) return {};

  return {
    title: `${item.title[lang]} — DONG HYEON`,
    description: item.summary[lang],
    alternates: {
      canonical: `/${lang}/work/${slug}`,
      languages: Object.fromEntries(
        LANGS.map((l) => [l, `/${l}/work/${slug}`])
      ),
    },
    openGraph: {
      title: item.title[lang],
      description: item.summary[lang],
      url: `/${lang}/work/${slug}`,
      type: "article",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

/** 본문 블록 — 제목 + 문단 여러 개. 비어 있으면 아무것도 렌더링하지 않는다. */
function Block({
  index,
  title,
  paragraphs,
}: {
  index: string;
  title: string;
  paragraphs?: string[];
}) {
  if (!paragraphs?.length) return null;

  return (
    <Reveal>
      <section className="border-t border-line pt-10">
        <p className="section-label">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden />
          {title}
        </p>
        <div className="mt-6 space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="max-w-2xl text-base leading-[1.85] text-muted"
            >
              {p}
            </p>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function MetricTable({ metrics, lang }: { metrics: Metric[]; lang: Lang }) {
  return (
    <ul className="mt-8 divide-y divide-line border-y border-line">
      {metrics.map((m, i) => (
        <li key={i} className="py-6">
          <p className="text-sm text-muted">{m.label[lang]}</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-3 font-mono">
            {m.before && (
              <>
                <span className="text-xl text-faint line-through decoration-faint/50 sm:text-2xl">
                  {m.before}
                </span>
                <span className="text-faint" aria-hidden>
                  →
                </span>
              </>
            )}
            <span className="text-3xl font-semibold text-accent sm:text-4xl">
              {m.after}
            </span>
          </p>
          {m.note && (
            <p className="mt-2 text-xs text-faint">{m.note[lang]}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  const item = workBySlug.get(slug);
  if (!item || !item.study) notFound();

  const ui = getUI(lang);
  const study = item.study;

  return (
    <article className="relative">
      {/* 본문이 긴 페이지라 3D 대신 정적 광원만 깔아 가독성을 지킨다 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.08),transparent_55%)]"
      />

      <header className="mx-auto max-w-3xl px-6 pt-32 pb-16">
        <Link
          href={`/${lang}#work`}
          className="font-mono text-xs text-faint transition-colors hover:text-accent"
        >
          ← {ui.caseStudy.back}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-faint">
          <span>
            {item.period}
            {item.ongoing ? " —" : ""}
          </span>
          <span aria-hidden>·</span>
          <span>{item.team ? ui.work.teamNote(item.team) : ui.work.soloNote}</span>
        </div>

        <h1 className="mt-4 text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
          {item.title[lang]}
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-[1.8] text-muted">
          {study.lead[lang]}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {item.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-faint"
            >
              {t}
            </span>
          ))}
        </div>

        {item.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            {item.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto max-w-3xl space-y-16 px-6 pb-32">
        <Block
          index="01"
          title={ui.caseStudy.problem}
          paragraphs={study.problem[lang]}
        />
        <Block
          index="02"
          title={ui.caseStudy.myRole}
          paragraphs={study.role[lang]}
        />
        <Block
          index="03"
          title={ui.caseStudy.approach}
          paragraphs={study.approach[lang]}
        />

        {Boolean(study.metrics?.length || study.result) && (
          <Reveal>
            <section className="border-t border-line pt-10">
              <p className="section-label">
                <span className="text-accent">04</span>
                <span className="h-px w-8 bg-line-strong" aria-hidden />
                {ui.caseStudy.result}
              </p>

              {study.metrics && (
                <MetricTable metrics={study.metrics} lang={lang} />
              )}

              {study.result && (
                <div className="mt-8 space-y-5">
                  {study.result[lang].map((p, i) => (
                    <p
                      key={i}
                      className="max-w-2xl text-base leading-[1.85] text-muted"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        )}

        <Block
          index="05"
          title={ui.caseStudy.retrospective}
          paragraphs={study.retrospective?.[lang]}
        />

        <Reveal>
          <Link
            href={`/${lang}#work`}
            className="inline-block border-t border-line pt-10 font-mono text-xs text-faint transition-colors hover:text-accent"
          >
            ← {ui.caseStudy.back}
          </Link>
        </Reveal>
      </div>
    </article>
  );
}
