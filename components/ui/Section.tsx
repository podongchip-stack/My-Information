import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

interface SectionProps {
  id: string;
  /** "01" 처럼 두 자리 문자열. 섹션 간 위계를 만드는 유일한 장치다. */
  index: string;
  label: string;
  title: string;
  lead?: string;
  children: ReactNode;
}

export default function Section({
  id,
  index,
  label,
  title,
  lead,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal>
        <p className="section-label">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden />
          {label}
        </p>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h2>
        {lead && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            {lead}
          </p>
        )}
      </Reveal>

      <div className="mt-12 sm:mt-16">{children}</div>
    </section>
  );
}
