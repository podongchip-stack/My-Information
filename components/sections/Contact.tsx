import ScrollReveal from "@/components/ui/ScrollReveal";
import LottieGreeting from "@/components/ui/LottieGreeting";

const CONTACT = {
  email: "podongchip@gmail.com",
  github: "https://github.com/podongchip-stack", 
  Kaggle: "https://www.kaggle.com/podongchip",
  HuggingFace: "https://huggingface.co/podongchip",
  YouTube: "https://www.youtube.com/@포테이송"
};

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-28">
      <ScrollReveal className="text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Contact
        </h2>
        <div className="mx-auto mb-8 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent-purple" />

        <p className="mb-10 text-muted">
          협업이나 문의는 언제든 환영합니다.
        </p>

        <a
          href={`mailto:${CONTACT.email}`}
          className="inline-block rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          {CONTACT.email}
        </a>

        <div className="mt-8 flex justify-center gap-6 text-sm text-muted">
          {CONTACT.github && (
            <a
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          )}
          {CONTACT.Kaggle && (
            <a
              href={CONTACT.Kaggle}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Kaggle
            </a>
          )}
          {CONTACT.HuggingFace && (
            <a
              href={CONTACT.HuggingFace}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Hugging Face
            </a>
          )}
          {CONTACT.YouTube && (
            <a
              href={CONTACT.YouTube}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              YouTube
            </a>
          )}
          
        </div>

        <div className="mt-28 flex flex-col items-center gap-3">
          <LottieGreeting />
          <p className="text-base font-semibold text-foreground sm:text-lg">
            끝까지 봐주셔서 감사합니다!
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
