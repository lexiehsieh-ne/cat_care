import { useCallback, useEffect, useState } from "react";
import type { CatGender, FoodType } from "@/lib/cat-constants";

export type User = { _id: string; name: string; email?: string };

export type Cat = { _id: string; owner: string; name: string; breed: string; gender: CatGender; age: string; avatarUrl?: string };

type CatRef = { _id: string; name: string };

export type FeedingRecord = {
  _id: string;
  cat: CatRef;
  createdBy: User;
  fedAt: string;
  foodType: FoodType;
  foodName: string;
  amountGrams: number;
  note: string;
  // 以下是加入熱量查詢後才有的欄位；舊紀錄在資料庫裡沒有，會是 undefined
  brand?: string;
  kcalPer100g?: number | null;
  kcal?: number | null;
  calorieProduct?: string;
  calorieSource?: string;
  calorieManual?: boolean;
};

export type WeightRecord = {
  _id: string;
  cat: CatRef;
  createdBy: User;
  measuredAt: string;
  weightGrams: number;
  note: string;
};

// 登入過期或被登出時（API 回 401）發出這個事件，讓畫面回到登入頁
export const AUTH_EXPIRED_EVENT = "cat-care:auth-expired";

// 呼叫後端 API；失敗時把後端回傳的錯誤訊息丟出來
// 登入狀態存在 HTTP-only Cookie，同網域的 fetch 會自動帶上，不需要手動處理 token
export async function api<T>(
  url: string,
  init?: { method?: string; body?: unknown; headers?: Record<string, string> },
): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: { ...(init?.body === undefined ? {} : { "Content-Type": "application/json" }), ...init?.headers },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 204) return undefined as T;
  if (res.status === 401 && !url.startsWith("/api/auth/")) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const details = data?.details ? `：${Object.keys(data.details).join("、")} 欄位有誤` : "";
    throw new Error(`${data?.error ?? `請求失敗（${res.status}）`}${details}`);
  }
  return data as T;
}

// 上傳貓咪大頭照：後端存到 Vercel Blob，並把公開網址寫進資料庫，回傳更新後的貓咪
export async function uploadAvatar(catId: string, file: File): Promise<Cat> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`/api/cats/${catId}/avatar`, { method: "POST", body: form });
  if (res.status === 401) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `上傳失敗（${res.status}）`);
  return data as Cat;
}

// 體重在資料庫存公克（整數、不會有誤差），畫面上一律顯示公斤
export function formatKg(grams: number) {
  return `${(grams / 1000).toFixed(2)} kg`;
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "發生未知錯誤";
}

// 讀取某個列表 API，並提供 reload 讓新增、修改、刪除後重新整理
export function useList<T>(url: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await api<T[]>(url);
      setItems(data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    api<T[]>(url)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { items, error, reload };
}

const TZ = "Asia/Taipei";

// <input type="datetime-local"> 需要「YYYY-MM-DDTHH:mm」格式的本地時間
export function toLocalInput(iso: string | Date = new Date()) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string) {
  return new Date(value).toISOString();
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", { timeZone: TZ, month: "numeric", day: "numeric", weekday: "short" });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-TW", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
}

export function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ });
}
