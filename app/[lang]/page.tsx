import { notFound } from "next/navigation";
import SceneCanvas from "@/components/scene/SceneCanvas";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Experience from "@/components/sections/Experience";
import Work from "@/components/sections/Work";
import OpenSource from "@/components/sections/OpenSource";
import Contact from "@/components/sections/Contact";
import { isLang } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <>
      <SceneCanvas />

      {/* 3D 위에 얹는 비네트 — 가장자리를 눌러 본문 대비를 확보한다 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_35%,transparent_0%,rgba(7,7,10,0.55)_55%,rgba(7,7,10,0.9)_100%)]"
      />

      <Hero lang={lang} />
      <Now lang={lang} />
      <Experience lang={lang} />
      <Work lang={lang} />
      <OpenSource lang={lang} />
      <Contact lang={lang} />
    </>
  );
}
