import Link from "next/link";
import { PawPrint, Utensils } from "lucide-react";
import { Ribbon } from "@/components/Ribbon";
import { InfoGrid } from "@/components/InfoGrid";

const FEATURES = [
  {
    number: "01",
    emoji: "🐱",
    title: "依品種與年齡客製化",
    description: "輸入貓咪的品種、年齡與飼養環境，AI 會依生命階段調整計算方式。",
  },
  {
    number: "02",
    emoji: "💬",
    title: "多輪追問，收集關鍵資訊",
    description: "AI 會依序詢問體重、絕育狀態、體態、活動量等 6 個問題，每題確認一項關鍵資訊。",
  },
  {
    number: "03",
    emoji: "📚",
    title: "依循 AAFCO 與 NRC 標準",
    description: "熱量與營養建議皆參考美國 AAFCO 營養標準與 NRC 能量需求公式。",
  },
];

const STEPS = [
  {
    emoji: "📝",
    title: "輸入基本資料",
    description: "填寫貓咪的品種、年齡，以及室內、室外或混合的飼養環境。",
  },
  {
    emoji: "🗨️",
    title: "回答 AI 的追問",
    description: "AI 會一題一題詢問體重、絕育狀態、活動量等，共 6 題，逐步完善資料。",
  },
  {
    emoji: "🍽️",
    title: "取得熱量與飲食建議",
    description: "獲得每日所需熱量估算、生命階段判定，以及具體的飲食建議。",
  },
];

const FAQS = [
  {
    question: "這個計算結果準確嗎？",
    answer:
      "計算依據 NRC 的能量需求公式與 AAFCO 營養標準估算，但每隻貓咪的代謝狀況不同，結果僅供參考，實際飲食調整仍建議諮詢獸醫師。",
  },
  {
    question: "為什麼需要回答好幾個問題？",
    answer:
      "準確估算熱量需要體重、絕育狀態、體態、活動量、目前飲食方式與健康狀況這 6 項資訊，AI 會一題問一項，共 6 題，問完就會算出結果。",
  },
  {
    question: "我的貓咪有慢性病，也能用嗎？",
    answer:
      "可以告訴 AI 相關健康狀況，它會將此納入建議與注意事項中，但特殊病症的飲食管理仍應以獸醫師的處方為準。",
  },
];

// 計算介紹頁：功能特色、使用方式、進入實際計算頁的按鈕，最後是常見問題
export function CalculatorInfoSections() {
  return (
    <>
      {/* Features */}
      <section id="features" className="scroll-mt-20 border-y border-line bg-card/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Ribbon>🐾 功能特色</Ribbon>
          <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            有科學依據的餵食建議
          </h2>
          <p className="mt-3 max-w-lg text-foreground/70">
            不是憑感覺估算，鏟屎官養成所針對每隻貓咪的狀況動態計算。
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.number}
                className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold font-display text-sm font-bold text-gold">
                    {feature.number}
                  </span>
                  <span className="text-3xl">{feature.emoji}</span>
                </div>
                <span className="text-lg font-extrabold text-foreground">
                  {feature.title}
                </span>
                <span className="text-sm leading-6 text-foreground/70">
                  {feature.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto scroll-mt-20 w-full max-w-5xl px-6 py-16">
        <Ribbon>📋 使用方式</Ribbon>
        <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
          三個步驟，掌握貓咪飲食
        </h2>
        <p className="mt-3 max-w-lg text-foreground/70">
          從輸入基本資料到拿到建議，只需要幾分鐘。
        </p>

        <InfoGrid items={STEPS} />
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-3xl border-2 border-dashed border-foreground/25 bg-card p-10 text-center sm:p-14">
          <Ribbon>🏠 讓貓咪吃得剛剛好</Ribbon>
          <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            現在就幫貓咪算出剛剛好的食量
          </h2>
          <p className="mx-auto mt-3 max-w-md text-foreground/70">
            輸入貓咪的基本資料，讓 AI 為牠量身計算每日所需熱量。
          </p>
          <Link
            href="/calculator/start"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            <Utensils className="h-4 w-4" />
            免費開始計算
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-y border-line bg-card/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Ribbon>❓ 常見問題</Ribbon>
          <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            使用前你可能想知道
          </h2>

          <div className="mt-8 flex flex-col gap-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-line bg-card p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 shrink-0 text-blush" />
                    {faq.question}
                  </span>
                  <span className="shrink-0 text-foreground/40 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 pl-6 text-sm leading-relaxed text-foreground/70">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
