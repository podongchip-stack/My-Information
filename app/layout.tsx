import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import ScrollToTop from "@/components/ui/ScrollToTop";

export const metadata: Metadata = {
  metadataBase: new URL("https://donghyeon-portfolio.vercel.app"),
  title: "포트폴리오 | 전자공학도 · 백엔드 · AI 엔지니어",
  description:
    "경상국립대학교 전자공학부 · EDCL 랩 BMS 연구 · 백엔드(Java/Spring) + AI 개발자 포트폴리오",
  openGraph: {
    title: "DONG HYEON | 백엔드 · AI 엔지니어 포트폴리오",
    description:
      "백엔드와 AI를 다루는 엔지니어, 하드웨어 지식도 곁들인 — 경상국립대 전자공학부 · BMS 연구 · Java/Spring + AI",
    url: "/",
    siteName: "DONG HYEON Portfolio",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DONG HYEON | 백엔드 · AI 엔지니어 포트폴리오",
    description:
      "백엔드와 AI를 다루는 엔지니어, 하드웨어 지식도 곁들인 — 전자공학전공 · 주니어 백엔드 개발자 · AI 엔지니어",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ScrollToTop />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
