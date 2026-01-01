import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "이철길 | 개발자 · 바이올린 애호가",
  description: "코드의 교향곡 - 개발과 클래식 음악이 만나는 곳. 풀스택 개발자 이철길의 포트폴리오입니다.",
  keywords: ["개발자", "포트폴리오", "풀스택", "바이올린", "클래식 음악", "react", "next.js"],
  authors: [{ name: "이철길", url: "https://chulgil.me" }],
  openGraph: {
    title: "이철길 | 개발자 · 바이올린 애호가",
    description: "코드의 교향곡 - 개발과 클래식 음악이 만나는 곳.",
    url: "https://chulgil.me",
    siteName: "이철길",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "이철길 | 개발자 · 바이올린 애호가",
    description: "코드의 교향곡 - 개발과 클래식 음악이 만나는 곳.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${sourceSerif.variable} antialiased`}
      >
        <SmoothScrollProvider>
          <ClientProviders>{children}</ClientProviders>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
