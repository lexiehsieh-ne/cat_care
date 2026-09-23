"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthForm } from "./AuthForm";
import { Button, ErrorBanner } from "./ui";
import { useCurrentUser } from "./useCurrentUser";

// 首頁的紀錄入口：只負責登入，登入後到 /records 看完整的飲食體重紀錄
export function HomeRecordsEntry() {
  const router = useRouter();
  const { user, error, logout } = useCurrentUser();

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md">
        <ErrorBanner message={`無法載入資料：${error}`} />
      </div>
    );
  }
  if (user === undefined) return <p className="py-10 text-center text-sm text-foreground/60">載入中…</p>;
  if (!user) return <AuthForm onAuthed={() => router.push("/records")} />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-line bg-card p-6 text-center shadow-sm sm:p-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-3xl" aria-hidden>
        🐾
      </span>
      <h3 className="mt-4 text-lg font-black">歡迎回來，{user.name}</h3>
      <p className="mt-1 text-sm text-foreground/60">你的貓咪飲食與體重紀錄都在這裡。</p>
      <Link
        href="/records"
        className="group mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
      >
        進入我的紀錄
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <Button variant="ghost" onClick={logout} className="mt-2">
        不是你？登出
      </Button>
    </div>
  );
}
