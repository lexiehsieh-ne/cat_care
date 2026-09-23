import { Ribbon } from "@/components/Ribbon";
import { HomeRecordsEntry } from "@/components/cat-care/HomeRecordsEntry";

// 首頁的飲食體重紀錄區塊：登入後到 /records 看完整紀錄
export function RecordsSection() {
  return (
    <section id="records" className="scroll-mt-20 border-t border-line bg-card/60">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <Ribbon>📒 飲食體重紀錄</Ribbon>
        <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
          <span className="inline-block">開始幫自己的</span>
          <span className="inline-block">貓咪記錄吧</span>
        </h2>
        <p className="mt-3 max-w-lg text-foreground/70">
          每天記下貓咪吃了多少、定期量體重，才知道份量是不是真的剛剛好。登入後換裝置也看得到紀錄。
        </p>

        <div className="mt-8">
          <HomeRecordsEntry />
        </div>
      </div>
    </section>
  );
}
