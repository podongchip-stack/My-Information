import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import ScrollToTop from "@/components/ui/ScrollToTop";

export const metadata: Metadata = {
  title: "포트폴리오 | 전자공학도 · 백엔드 · AI 엔지니어",
  description:
    "경상국립대학교 전자공학부 · EDCL 랩 BMS 연구 · 백엔드(Java/Spring) + AI 개발자 포트폴리오",
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
