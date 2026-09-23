import type { Metadata } from "next";
import { Baloo_2, Ma_Shan_Zheng, Noto_Sans_TC } from "next/font/google";
import { FloatingAdoptionBanner } from "@/components/FloatingAdoptionBanner";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-body",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

const baloo2 = Baloo_2({
  variable: "--font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const maShanZheng = Ma_Shan_Zheng({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "鏟屎官養成所 Purr Academy",
  description:
    "認識貓咪習性、避開飼養常見錯誤、用 AI 算出貓咪每天該吃多少，並記錄飲食與體重。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSansTC.variable} ${baloo2.variable} ${maShanZheng.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingAdoptionBanner />
      </body>
    </html>
  );
}
