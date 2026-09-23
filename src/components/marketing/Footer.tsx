import Link from "next/link";
import { Calculator, Cat, HeartHandshake, NotebookPen, TriangleAlert, Utensils } from "lucide-react";
import { CatMark } from "@/components/CatMark";

// 依欄排列：前三個在左欄、後三個在右欄（各自由上到下）
const NAV_LINKS = [
  { href: "/#cat-behavior", label: "貓咪習性", icon: Cat },
  { href: "/#calories", label: "該吃多少", icon: Utensils },
  { href: "/#cat-mistakes", label: "常見錯誤", icon: TriangleAlert },
  { href: "/#records", label: "飲食體重紀錄", icon: NotebookPen },
  { href: "/calculator", label: "開始計算熱量", icon: Calculator },
  { href: "/adoption", label: "領養小貓", icon: HeartHandshake },
];

export function MarketingFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 text-gold-soft">
              <CatMark className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-black">鏟屎官養成所</span>
              <span className="mt-1 font-display text-[11px] font-bold tracking-wider text-gold-soft">
                Purr Academy
              </span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-background/70">
            從認識貓咪習性、避開飼養地雷，到算出每日熱量、記錄飲食與體重，陪你成為稱職的鏟屎官。
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-background/50">網站導覽</h3>
          {/* 兩欄、每欄由上往下排 */}
          <ul className="mt-3 grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-6 gap-y-2 text-sm">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-background/80 transition-colors hover:text-background"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 px-6 py-5 text-center text-xs text-background/50">
        © {new Date().getFullYear()} 鏟屎官養成所 Purr Academy．熱量與飲食建議僅供參考，並非獸醫診斷或處方。
      </div>
    </footer>
  );
}
