import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "昊道文化 HAODAO Culture",
  description: "陪伴生命成長，提升內心文明，走向光明與覺醒。",
  other: { "codex-preview": "development" },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
