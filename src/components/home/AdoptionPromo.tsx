import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Polaroid } from "@/components/adoption/Polaroid";

const HIGHLIGHTS = ["🐾 約 3 個月大", "💉 疫苗驅蟲已完成", "⭐ 雙貓優先領養"];

// 首頁的領養促銷區塊：深色卡片跳出來，點了進 /adoption
export function AdoptionPromo() {
  return (
    <section id="adopt-promo" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 rounded-3xl bg-foreground p-8 text-background shadow-xl sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 text-sm font-bold text-foreground">
              🏠 領養小貓
            </span>
            <div className="mt-5 flex items-center gap-3 text-gold-soft">
              <span aria-hidden>♡</span>
              <span className="font-script text-2xl">兩隻小玳瑁</span>
              <span aria-hidden>♡</span>
            </div>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              正在尋找<span className="text-gold">永遠的家</span>
            </h2>
            <p className="mt-4 max-w-md leading-7 text-background/75">
              約 3 個月大的玳瑁姊妹，血檢過關、疫苗驅蟲都已完成，健康活潑、感情超好。願意給牠們一個安穩的家嗎？
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="rounded-full border border-background/20 px-3 py-1 text-sm font-medium text-background/90">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/adoption"
                className="group inline-flex items-center gap-2 rounded-full bg-gold-soft px-6 py-3 text-sm font-bold text-foreground transition-opacity hover:opacity-90"
              >
                認識牠們
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/adoption#adopt"
                className="rounded-full border-2 border-background/30 px-6 py-3 text-sm font-bold text-background transition-colors hover:border-background/60"
              >
                認養須知
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs">
            <Polaroid src="/images/sister.jpg" alt="玳瑁小姊妹" className="aspect-[4/5] w-full rotate-3" />
            <div className="absolute -left-3 -top-3 z-10 flex h-20 w-20 -rotate-6 flex-col items-center justify-center rounded-full border-4 border-dashed border-foreground bg-gold text-center text-foreground shadow-lg">
              <span className="text-[10px] font-bold leading-tight">徵求</span>
              <span className="text-sm font-black leading-tight">好主人</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
