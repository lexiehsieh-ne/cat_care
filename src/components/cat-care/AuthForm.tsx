"use client";

import { useState, type FormEvent } from "react";
import { api, errorMessage, type User } from "./api";
import { Button, ErrorBanner, Field, inputClass } from "./ui";

type Mode = "login" | "register";

// 登入 / 註冊畫面；成功後後端會把 JWT 存進 HTTP-only Cookie
export function AuthForm({ onAuthed }: { onAuthed: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "register" && password !== confirm) {
      setError("兩次輸入的密碼不一樣");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const user =
        mode === "login"
          ? await api<User>("/api/auth/login", { method: "POST", body: { email, password } })
          : await api<User>("/api/auth/register", { method: "POST", body: { email, password, name } });
      onAuthed(user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  const tabClass = (active: boolean) =>
    `min-h-11 flex-1 rounded-full text-sm font-bold transition-colors sm:min-h-10 sm:pointer-coarse:min-h-11 ${
      active
        ? "bg-card text-foreground shadow-sm"
        : "text-foreground/70 hover:text-foreground"
    }`;

  return (
    <div className="mx-auto w-full max-w-md">
      <section className="w-full rounded-3xl border border-line bg-card p-5 text-left shadow-sm sm:p-6">
        <h3 className="mb-4 text-center text-lg font-black">
          <span aria-hidden>🐾 </span>
          {mode === "login" ? "登入你的帳號" : "建立新帳號"}
        </h3>
        <div role="tablist" className="mb-5 flex gap-1 rounded-full bg-line/70 p-1">
          <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")} className={tabClass(mode === "login")}>
            登入
          </button>
          <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchMode("register")} className={tabClass(mode === "register")}>
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Email">
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          {mode === "register" && (
            <Field label="顯示名稱（選填）">
              <input maxLength={30} autoComplete="nickname" placeholder="沒填會用 Email @ 前面的文字" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
          )}
          <Field label={mode === "register" ? "密碼（至少 8 個字元）" : "密碼"}>
            <input
              type="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          {mode === "register" && (
            <Field label="再輸入一次密碼">
              <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </Field>
          )}
          <ErrorBanner message={error} />
          <Button type="submit" disabled={pending} className="mt-1 w-full">
            {pending ? "處理中…" : mode === "login" ? "登入" : "註冊並登入"}
          </Button>
        </form>
      </section>
    </div>
  );
}
