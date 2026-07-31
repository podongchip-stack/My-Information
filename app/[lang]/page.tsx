import { notFound } from "next/navigation";
import Hero from "@/components/ui/Hero";
import Footer from "@/components/ui/Footer";
import Kpis from "@/components/sections/Kpis";
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
    <div className="mx-auto max-w-4xl px-6 pb-10">
      <Hero lang={lang} />
      <main className="pt-14">
        <Kpis lang={lang} />
        <div className="mt-14">
          <GitGraph lang={lang} />
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
