"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

// 關掉後這次瀏覽都不再出現（關閉分頁後重開才會再出現）
const CLOSED_KEY = "cat-care:adopt-banner-closed";
const CHANGE_EVENT = "cat-care:adopt-banner-change";

function isClosed() {
  try {
    return sessionStorage.getItem(CLOSED_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function close() {
  try {
    sessionStorage.setItem(CLOSED_KEY, "1");
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const closeButton =
  "flex items-center justify-center rounded-full transition-colors pointer-coarse:size-11";

// 浮動在右下角的領養 banner：點了進 /adoption；在領養頁本身不顯示
export function FloatingAdoptionBanner() {
  const pathname = usePathname();
  // 伺服器端先當作已關閉，避免和瀏覽器端的 sessionStorage 不一致
  const closed = useSyncExternalStore(subscribe, isClosed, () => true);
  if (closed || pathname.startsWith("/adoption")) return null;

  return (
    <aside aria-label="領養小貓" className="fixed right-3 bottom-4 z-30 sm:right-5 sm:bottom-6">
      {/* 手機：小膠囊 */}
      <div className="flex items-center gap-1 rounded-full bg-foreground py-1 pr-1 pl-1 text-background shadow-xl sm:hidden">
        <Link href="/adoption" className="flex items-center gap-2 pr-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sister.jpg" alt="" className="size-9 rounded-full object-cover" />
          <span className="text-sm font-bold">領養小玳瑁</span>
        </Link>
        <button type="button" onClick={close} aria-label="關閉領養廣告" className={`${closeButton} size-8 text-background/70 hover:bg-background/10`}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 平板以上：小卡片 */}
      <div className="relative hidden w-60 overflow-hidden rounded-3xl border border-line bg-card shadow-2xl sm:block">
        <button
          type="button"
          onClick={close}
          aria-label="關閉領養廣告"
          className={`${closeButton} absolute top-2 right-2 z-10 size-8 bg-foreground/70 text-background hover:bg-foreground`}
        >
          <X className="h-4 w-4" />
        </button>
        <Link href="/adoption" className="group block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sister.jpg" alt="玳瑁小姊妹" className="h-44 w-full object-cover object-[50%_45%]" />
          <div className="p-4">
            <span className="inline-flex rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-foreground">🏠 領養小貓</span>
            <p className="mt-2 font-black leading-snug text-foreground">兩隻小玳瑁，正在尋找永遠的家</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blush">
              認識牠們
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
