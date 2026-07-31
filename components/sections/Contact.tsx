import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import LottieGreeting from "@/components/ui/LottieGreeting";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

const EMAIL = "podongchip@gmail.com";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/podongchip-stack" },
  { label: "Hugging Face", href: "https://huggingface.co/podongchip" },
  { label: "Kaggle", href: "https://www.kaggle.com/podongchip" },
  { label: "YouTube", href: "https://www.youtube.com/@포테이송" },
];

export default function Contact({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  return (
    <Section
      id="contact"
      index="05"
      label={ui.contact.label}
      title={ui.contact.title}
      lead={ui.contact.lead}
    >
      <Reveal>
        <a
          href={`mailto:${EMAIL}`}
          className="inline-block text-2xl font-semibold tracking-tight break-all text-accent transition-opacity hover:opacity-80 sm:text-4xl"
        >
          {EMAIL}
        </a>
      </Reveal>

      <Reveal delay={0.08}>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-8 text-sm">
          {SOCIALS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-foreground"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-24 flex flex-col items-center gap-3">
          <LottieGreeting label={ui.contact.greetingAlt} />
          <p className="text-base font-medium">{ui.contact.thanks}</p>
        </div>
      </Reveal>
    </Section>
  );
}
