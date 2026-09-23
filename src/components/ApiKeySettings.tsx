"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from "lucide-react";
import { clearStoredApiKey, maskApiKey, setStoredApiKey } from "@/lib/api-key-storage";
import { useApiKey } from "@/lib/use-api-key";
import { API_KEY_HEADER } from "@/lib/constants";

// 計算器頁的步驟 1：驗證並儲存使用者自己的 OpenAI API Key（只存在這台裝置的瀏覽器）
export function ApiKeySettings() {
  const savedKey = useApiKey();
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setValidating(true);
    setValidationError(null);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { [API_KEY_HEADER]: trimmed },
      });
      const data = (await res.json()) as { valid: boolean; error?: string };

      if (!res.ok || !data.valid) {
        setValidationError(data.error ?? "驗證失敗，請確認 API Key 是否正確");
        return;
      }

      setStoredApiKey(trimmed);
      setInput("");
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    } catch {
      setValidationError("網路錯誤，無法驗證 API Key，請稍後再試");
    } finally {
      setValidating(false);
    }
  }

  function handleClear() {
    clearStoredApiKey();
    setInput("");
    setValidationError(null);
  }

  return (
    <div>
      <p className="mb-5 text-sm leading-6 text-foreground/60">
        鏟屎官養成所採用 BYOK（Bring Your Own Key）模式，你的 Key
        只會儲存在這台裝置的瀏覽器內，僅在每次呼叫熱量計算 API
        時隨請求夾帶使用，我們不會在伺服器儲存或記錄它。
      </p>

      <section className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 shadow-sm">
        {savedKey ? (
          <div className="flex items-center justify-between rounded-xl bg-sage-soft px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-sage">
              <CheckCircle2 size={16} />
              已設定：{maskApiKey(savedKey)}
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-sm font-medium text-blush hover:opacity-80"
            >
              <Trash2 size={14} />
              清除
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-foreground">
            尚未設定 API Key，請於下方輸入後開始使用。
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground/80">
            {savedKey ? "更新 API Key" : "輸入 API Key"}
          </label>
          <div className="relative">
            <input
              type={showInput ? "text" : "password"}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setValidationError(null);
              }}
              placeholder="sk-..."
              className="w-full rounded-xl border border-line bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold-soft"
            />
            <button
              type="button"
              onClick={() => setShowInput((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
              aria-label={showInput ? "隱藏" : "顯示"}
            >
              {showInput ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!input.trim() || validating}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {validating && <Loader2 size={14} className="animate-spin" />}
          {validating ? "驗證中..." : "驗證並儲存"}
        </button>

        {validationError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {validationError}
          </div>
        )}

        {savedMessage && (
          <p className="text-sm font-medium text-sage">
            驗證成功，已儲存到這台裝置的瀏覽器。
          </p>
        )}
      </section>

      <p className="mt-4 text-xs text-foreground/50">
        還沒有 API Key？前往{" "}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground/80"
        >
          OpenAI 官方頁面
        </a>{" "}
        申請。
      </p>
    </div>
  );
}
