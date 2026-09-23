import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";

// 計算結果頁用：接在熱量結果下方，引導到首頁的飲食體重紀錄
export function RecordsPromoCard({ dailyCalories }: { dailyCalories: number }) {
  return (
    <section className="mt-6 flex flex-col gap-4 rounded-3xl border-2 border-dashed border-foreground/25 bg-sage-soft/60 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card text-2xl" aria-hidden>
          📒
        </span>
        <div>
          <h2 className="text-lg font-black text-foreground">
            <span className="inline-block">開始幫自己的</span>
            <span className="inline-block">貓咪記錄吧</span>
          </h2>
          <p className="mt-1 text-sm leading-6 text-foreground/70">
            以每天 {dailyCalories} 大卡為目標，記下每餐吃了多少、定期量體重，就知道份量是否剛剛好。
          </p>
        </div>
      </div>
      <Link
        href="/#records"
        className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90 sm:self-center"
      >
        <NotebookPen className="h-4 w-4" />
        開始記錄
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
