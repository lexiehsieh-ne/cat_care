import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/Header";
import { MarketingFooter } from "@/components/marketing/Footer";
import { CalculatorInfoSections } from "@/components/CalculatorInfoSections";

export const metadata: Metadata = {
  title: "AI 貓咪熱量計算｜鏟屎官養成所",
  description: "依 AAFCO 與 NRC 標準，透過 6 個問題算出貓咪每日所需熱量並提供飲食建議。",
};

// 熱量計算介紹頁；按「免費開始計算」才進到 /calculator/start 設定 API Key 並輸入資料
export default function CalculatorIntroPage() {
  return (
    <>
      <MarketingHeader />
      <div className="flex flex-1 flex-col bg-background">
        <h1 className="sr-only">AI 貓咪熱量計算</h1>
        <CalculatorInfoSections />
      </div>
      <MarketingFooter />
    </>
  );
}
