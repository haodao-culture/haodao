import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { assetUrl } from "./lib/assets";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://new2.haodao.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "昊道文化｜新版官網架構建置中",
  description:
    "昊道文化新版官網架構的獨立測試環境。",
  openGraph: {
    title: "昊道文化｜新版官網架構建置中",
    description: "昊道文化新版官網架構的獨立測試環境。",
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
    title: "昊道文化｜新版官網架構建置中",
    description: "昊道文化新版官網架構的獨立測試環境。",
    images: [assetUrl("/home-hero.png")],
  },
};

const assetStyles = {
  "--asset-hero-walk": `url("${assetUrl("/images/about-hero.webp")}")`,
  "--asset-quiet-room": `url("${assetUrl("/images/learning-hero.webp")}")`,
  "--asset-calligraphy": `url("${assetUrl("/images/fazhou-calligraphy.webp")}")`,
  "--asset-garden-meditation": `url("${assetUrl("/images/community-activity.webp")}")`,
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
