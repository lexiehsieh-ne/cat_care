import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/Header";
import { MarketingFooter } from "@/components/marketing/Footer";
import { Ribbon } from "@/components/Ribbon";
import { RecordsSection } from "@/components/RecordsSection";
import { CatBehaviorSection } from "@/components/home/CatBehaviorSection";
import { CatMistakesSection } from "@/components/home/CatMistakesSection";
import { AdoptionPromo } from "@/components/home/AdoptionPromo";

export default function LandingPage() {
  return (
    <>
      <MarketingHeader />

      <div className="flex flex-1 flex-col bg-background">
        {/* 1. 貓咪照顧資訊 */}
        <CatBehaviorSection />

        {/* 2. 貓咪照顧常見錯誤 */}
        <CatMistakesSection />

        {/* 領養小貓促銷 */}
        <AdoptionPromo />

        {/* 3. 貓咪該吃多少 */}
        <div id="calories" className="scroll-mt-20 border-t border-line">
          <section className="mx-auto grid w-full max-w-5xl gap-16 px-6 pb-20 pt-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-blush">
                <span aria-hidden>♡</span>
                <span className="font-script text-2xl">AI 貓咪營養顧問</span>
                <span aria-hidden>♡</span>
              </div>

              <h1 className="mt-3 text-5xl font-black leading-[1.05] text-foreground sm:text-6xl">
                你家貓咪，
                <br />
                <span className="text-blush">每天該吃多少？</span>
              </h1>

              <Ribbon className="mt-6">計算．追問．建議</Ribbon>

              <p className="mt-6 max-w-md leading-7 text-foreground/70">
                鏟屎官養成所依據 AAFCO 與 NRC 標準，透過幾個問題了解你的貓咪，計算每日所需熱量並提供飲食建議。
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-4 py-1.5 text-sm font-bold text-foreground">
                🐾 依 AAFCO／NRC 標準計算，不是憑感覺估算
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/calculator"
                  className="rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
                >
                  免費開始計算
                </Link>
                <Link
                  href="/calculator#how-it-works"
                  className="rounded-full border-2 border-foreground/20 bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-foreground/40"
                >
                  了解運作方式
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="rotate-2 rounded-2xl bg-card p-2 shadow-xl">
                <div className="flex flex-col gap-3 rounded-xl bg-background p-4">
                  <div className="self-start rounded-2xl rounded-tl-sm bg-blush-soft px-4 py-2.5 text-sm text-foreground">
                    請問你的貓咪目前體重大概是多少公斤？
                  </div>
                  <div className="self-end rounded-2xl rounded-tr-sm bg-foreground px-4 py-2.5 text-sm text-background">
                    大概 4.2 公斤，已經絕育了。
                  </div>
                  <div className="self-start rounded-2xl rounded-tl-sm bg-blush-soft px-4 py-2.5 text-sm text-foreground">
                    了解，那牠平常活動量算多還是偏少呢？
                  </div>
                </div>
              </div>
              <div className="absolute -right-3 -top-3 z-10 flex h-20 w-20 rotate-6 flex-col items-center justify-center rounded-full border-4 border-dashed border-background bg-foreground text-center text-background shadow-lg sm:-right-6 sm:-top-6 sm:h-24 sm:w-24">
                <span className="text-[10px] font-bold leading-tight sm:text-[11px]">
                  每日約
                </span>
                <span className="text-xs font-black leading-tight sm:text-sm">
                  320 大卡
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* 4. 貓咪飲食體重紀錄 */}
        <RecordsSection />
      </div>

      <MarketingFooter />
    </>
  );
}
