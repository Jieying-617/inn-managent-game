import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "澜申里洋房｜民宿经营试玩版",
  description: "一款可自由铺设格子、布置房间与探索搭配图册的像素民宿经营游戏试玩版。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
