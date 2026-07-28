import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { assetUrl } from "./lib/assets";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.haodao.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "昊道文化｜在覺察裡，走回生命的從容",
  description:
    "昊道文化 MVP 展示網站。透過學習、共修與服務，陪伴每個人把內在安定帶回日常。",
  openGraph: {
    title: "昊道文化｜在覺察裡，走回生命的從容",
    description:
      "透過學習、共修、公益服務與昊道法舟，陪伴每個人把內在安定帶回日常。",
    images: [
      {
        url: assetUrl("/home-hero.png"),
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
    images: [assetUrl("/home-hero.png")],
  },
};

const assetStyles = {
  "--asset-hero-walk": `url("${assetUrl("/images/hero-walk.jpg")}")`,
  "--asset-quiet-room": `url("${assetUrl("/images/quiet-room.jpg")}")`,
  "--asset-calligraphy": `url("${assetUrl("/images/calligraphy.jpg")}")`,
  "--asset-garden-meditation": `url("${assetUrl("/images/garden-meditation.jpg")}")`,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body style={assetStyles}>{children}</body>
    </html>
  );
}
