import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { HTML_LANG, LANGS, isLang, type Lang } from "@/lib/i18n";
import { getUI } from "@/lib/content/ui";

const SITE_URL = "https://donghyeon-portfolio.vercel.app";

// ko/en 외의 세그먼트는 렌더링 자체를 막는다. 레이아웃 안에서 notFound()를
// 부르면 not-found 경계를 찾을 곳이 없으므로, 라우팅 단계에서 걸러내는 편이 안전하다.
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const ui = getUI(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: ui.meta.title,
    description: ui.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        LANGS.map((l) => [HTML_LANG[l], `/${l}`])
      ),
    },
    openGraph: {
      title: ui.meta.ogTitle,
      description: ui.meta.ogDescription,
      url: `/${lang}`,
      siteName: "DONG HYEON Portfolio",
      locale: lang === "ko" ? "ko_KR" : "en_US",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.meta.ogTitle,
      description: ui.meta.ogDescription,
      images: ["/og-image.png"],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed: Lang = lang;

  return (
    <html lang={HTML_LANG[typed]} className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
        {/* JS 없는 환경에서는 스크롤 리빌 요소를 즉시 보이게 한다 */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;translate:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
