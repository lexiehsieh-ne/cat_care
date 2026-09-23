"use client";

import { useEffect, useState } from "react";
import { AUTH_EXPIRED_EVENT, api, errorMessage, type User } from "./api";

// 目前登入的使用者：undefined = 還在確認；null = 未登入
export function useCurrentUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // 重新整理時：用 Cookie 裡的 JWT 問後端「我是誰」，恢復登入狀態
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) return setUser(null);
      if (!res.ok) throw new Error(`無法確認登入狀態（${res.status}）`);
      setUser(await res.json());
    })().catch((err) => setError(errorMessage(err)));
  }, []);

  // 任何 API 回 401（例如 JWT 過期）就回到登入畫面
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
  }

  return { user, setUser, error, logout };
}
