import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/Header";
import { MarketingFooter } from "@/components/marketing/Footer";
import { Ribbon } from "@/components/Ribbon";
import { CatCareApp } from "@/components/cat-care/CatCareApp";

export const metadata: Metadata = {
  title: "我的貓咪紀錄｜鏟屎官養成所",
  description: "記錄貓咪的飲食與體重",
};

// 登入後的飲食體重紀錄頁；未登入時這裡也會顯示登入表單
export default function RecordsPage() {
  return (
    <>
      <MarketingHeader />
      <div className="flex flex-1 flex-col bg-background">
        <section className="border-t border-line bg-card/60">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <Ribbon>📒 飲食體重紀錄</Ribbon>
            <h1 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">我的貓咪紀錄</h1>
            <p className="mt-3 max-w-lg text-foreground/70">
              選好貓咪就能新增飲食和體重紀錄，體重變化會畫成折線圖。
            </p>

            <div className="mt-8">
              <CatCareApp />
            </div>
          </div>
        </section>
      </div>
      <MarketingFooter />
    </>
  );
}
