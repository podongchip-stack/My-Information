import { notFound } from "next/navigation";
import Hero from "@/components/ui/Hero";
import Footer from "@/components/ui/Footer";
import ResultWindow from "@/components/sections/ResultWindow";
import Stats from "@/components/sections/Stats";
import GitGraph from "@/components/sections/GitGraph";
import { isLang } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <div className="mx-auto max-w-[1080px] px-4 md:px-8">
      <Hero lang={lang} />
      <main>
        <ResultWindow lang={lang} />
        <Stats lang={lang} />
        <div className="mt-14">
          <GitGraph lang={lang} />
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
