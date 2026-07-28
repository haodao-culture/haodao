import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "昊道文化｜在覺察裡，走回生命的從容",
  description:
    "昊道文化 MVP 展示網站。透過學習、共修與服務，陪伴每個人把內在安定帶回日常。",
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
