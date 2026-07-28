import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "昊道文化｜在覺察裡，走回生命的從容",
  description:
    "昊道文化 MVP 展示網站。透過學習、共修與服務，陪伴每個人把內在安定帶回日常。",
  openGraph: {
    title: "昊道文化｜在覺察裡，走回生命的從容",
    description:
      "透過學習、共修、公益服務與昊道法舟，陪伴每個人把內在安定帶回日常。",
    images: [
      {
        url: "https://haodao-culture-mvp-2026.shianyow.chatgpt.site/home-hero.png",
        width: 1659,
        height: 948,
        alt: "昊道文化｜在覺察裡，走回生命的從容",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "昊道文化｜在覺察裡，走回生命的從容",
    description:
      "透過學習、共修、公益服務與昊道法舟，陪伴每個人把內在安定帶回日常。",
    images: [
      "https://haodao-culture-mvp-2026.shianyow.chatgpt.site/home-hero.png",
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
