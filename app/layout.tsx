import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "吃喝玩乐全攻略｜上海",
  description:
    "在上海，根据当下场景与个人偏好，发现真正适合自己的吃喝玩乐选择。",
  openGraph: {
    title: "吃喝玩乐全攻略｜上海",
    description: "在上海，找到此刻真正适合你的去处。",
    images: ["/og.png"],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "吃喝玩乐全攻略｜上海",
    description: "在上海，找到此刻真正适合你的去处。",
    images: ["/og.png"],
  },
  other: {
    "codex-preview": "shanghai-beta",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
