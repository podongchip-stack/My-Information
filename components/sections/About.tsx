import ScrollReveal from "@/components/ui/ScrollReveal";

const INFO = [
  { label: "소속", value: "경상국립대학교 전자공학부\nGyeongsang National University\nElectronic Engineering" },
  {
    label: "연구실",
    value: "BNIT Electronic Design Circuit Lab",
  },
  { label: "관심사", value: "백엔드 개발 · AI 모델 학습 · BMS\n( Battery Management System )" },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-28">
      <ScrollReveal>
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          About
        </h2>
        <div className="mb-12 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent-purple" />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <p className="mb-12 max-w-3xl text-base leading-relaxed text-muted">
          백엔드 개발과 AI 모델 학습을 중심으로 성장하는 엔지니어입니다.
          Java/Spring으로 서버를 설계하고 직접 AI 모델을 학습시키는 것을 주력으로
          하며, 전자전공으로 하드웨어적인 지식도 가지고 있습니다.
        </p>
      </ScrollReveal>

      <div className="space-y-6">
        {INFO.map((item, i) => (
          <ScrollReveal key={item.label} delay={0.15 + i * 0.1}>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <p className="w-24 shrink-0 text-sm font-medium text-accent">
                {item.label}
              </p>
              <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
                {item.value}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
