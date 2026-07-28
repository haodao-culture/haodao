import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "昊道文化｜雙版本網站架構展示",
  description:
    "比較昊道文化原始架構與使用者路徑建議架構，實際體驗兩種不同的網站導覽方式。",
  openGraph: {
    title: "昊道文化｜雙版本網站架構展示",
    description:
      "同一份內容，兩種抵達的方式。比較原始架構與使用者路徑建議架構。",
    images: [
      {
        url: "https://haodao-culture-mvp-2026.shianyow.chatgpt.site/og-architecture.png",
        width: 1760,
        height: 893,
        alt: "昊道文化網站架構對焦展示",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "昊道文化｜雙版本網站架構展示",
    description:
      "同一份內容，兩種抵達的方式。比較原始架構與使用者路徑建議架構。",
    images: [
      "https://haodao-culture-mvp-2026.shianyow.chatgpt.site/og-architecture.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
