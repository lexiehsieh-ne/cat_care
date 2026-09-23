"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  PawPrint,
  RotateCcw,
  Utensils,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Ribbon } from "@/components/Ribbon";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { BodyConditionGuide } from "@/components/BodyConditionGuide";
import { RecordsPromoCard } from "@/components/RecordsPromo";
import { useApiKey } from "@/lib/use-api-key";
import { API_KEY_HEADER } from "@/lib/constants";
import type {
  CalorieResponse,
  CalorieResultResponse,
  CalorieTurn,
  CatEnvironment,
} from "@/lib/calorie-types";
import { ENVIRONMENT_LABELS, TOTAL_QUESTIONS } from "@/lib/calorie-types";

type Stage = "setup" | "asking" | "result";

const FIELD_CLASS =
  "w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold-soft";

function sanitizeIntegerInput(raw: string): string {
  const digitsOnly = raw.replace(/[^0-9]/g, "");
  if (digitsOnly.length <= 1) return digitsOnly;
  return digitsOnly.replace(/^0+/, "") || "0";
}

export default function CalculatorPage() {
  const apiKey = useApiKey();

  const [breed, setBreed] = useState("");
  const [ageYears, setAgeYears] = useState("1");
  const [ageMonths, setAgeMonths] = useState("0");
  const [environment, setEnvironment] = useState<CatEnvironment>("indoor");

  const [stage, setStage] = useState<Stage>("setup");
  const [history, setHistory] = useState<CalorieTurn[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalorieResultResponse | null>(null);

  // 畫面上最後一則是 AI 還沒被回答的問題，所以題號看 AI 問了幾題、進度條看已回答幾題
  const currentQuestion = history.filter((t) => t.role === "assistant").length;
  const answeredCount = history.filter((t) => t.role === "user").length;
  const progressPercent = Math.min(100, (answeredCount / TOTAL_QUESTIONS) * 100);

  async function callCaloriesApi(nextHistory: CalorieTurn[]) {
    if (!apiKey) {
      setError("請先在上方步驟 1 設定你的 OpenAI API Key");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [API_KEY_HEADER]: apiKey,
        },
        body: JSON.stringify({
          profile: {
            breed,
            ageYears: Number(ageYears) || 0,
            ageMonths: Number(ageMonths) || 0,
            environment,
          },
          history: nextHistory,
        }),
      });
      const data = (await res.json()) as CalorieResponse | { error: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "發生未知錯誤");
        return;
      }

      if (data.type === "question") {
        setHistory([
          ...nextHistory,
          {
            role: "assistant",
            content: data.question,
            ...(data.visualAid ? { visualAid: data.visualAid } : {}),
          },
        ]);
        setStage("asking");
      } else {
        setHistory(nextHistory);
        setResult(data);
        setStage("result");
      }
    } catch {
      setError("網路錯誤，請確認伺服器是否正常運作");
    } finally {
      setLoading(false);
    }
  }

  function handleStart() {
    if (!breed.trim()) {
      setError("請先輸入貓咪品種");
      return;
    }
    const years = Number(ageYears) || 0;
    const months = Number(ageMonths) || 0;
    if (years === 0 && months === 0) {
      setError("請輸入有效的年齡");
      return;
    }
    callCaloriesApi([]);
  }

  function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError("請輸入回答內容");
      return;
    }
    const nextHistory: CalorieTurn[] = [
      ...history,
      { role: "user", content: answer.trim() },
    ];
    setAnswer("");
    callCaloriesApi(nextHistory);
  }

  function handleRestart() {
    setBreed("");
    setAgeYears("1");
    setAgeMonths("0");
    setEnvironment("indoor");
    setStage("setup");
    setHistory([]);
    setAnswer("");
    setError(null);
    setResult(null);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-3 whitespace-nowrap text-xs font-medium text-foreground/70 sm:gap-4 sm:text-sm">
            <Link
              href="/#records"
              className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background transition-opacity hover:opacity-90 sm:text-sm"
            >
              紀錄飲食體重
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="sr-only">AI 貓咪熱量計算</h1>

          {/* 步驟 1：API Key 設定 */}
          <section id="api-key" className="scroll-mt-20">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <Ribbon>🔑 步驟 1</Ribbon>
              <h2 className="font-display text-3xl font-black text-foreground">
                設定你的 OpenAI API Key
              </h2>
            </div>
            <ApiKeySettings />
          </section>

          {/* 步驟 2：幫貓咪計算熱量 */}
          <section id="calculate" className="mt-12 scroll-mt-20 border-t-2 border-dashed border-line pt-12">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <Ribbon>🐾 步驟 2</Ribbon>
              <h2 className="font-display text-3xl font-black text-foreground">
                幫貓咪算出剛剛好的食量
              </h2>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {stage === "setup" && (
              <section className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 shadow-sm">
                {!apiKey && (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-gold-soft px-4 py-3 text-sm text-foreground">
                    <span>尚未設定 OpenAI API Key，請先完成上方步驟 1 才能開始計算。</span>
                    <a
                      href="#api-key"
                      className="shrink-0 rounded-full bg-foreground/10 px-3 py-1 font-bold hover:bg-foreground/20"
                    >
                      前往設定
                    </a>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">
                    貓咪品種
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="例如：美國短毛貓、英國短毛貓、混種貓..."
                    className={FIELD_CLASS}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">年齡</label>
                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={ageYears}
                        onChange={(e) => setAgeYears(sanitizeIntegerInput(e.target.value))}
                        className={`${FIELD_CLASS} min-w-0 text-center`}
                      />
                      <span className="shrink-0 text-sm text-foreground/70">歲</span>
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={ageMonths}
                        onChange={(e) => setAgeMonths(sanitizeIntegerInput(e.target.value))}
                        className={`${FIELD_CLASS} min-w-0 text-center`}
                      />
                      <span className="shrink-0 text-sm text-foreground/70">個月</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">
                    飼養環境
                  </label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as CatEnvironment)}
                    className={FIELD_CLASS}
                  >
                    {(Object.keys(ENVIRONMENT_LABELS) as CatEnvironment[]).map((key) => (
                      <option key={key} value={key}>
                        {ENVIRONMENT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleStart}
                  disabled={loading || !apiKey}
                  className="group mt-1 inline-flex items-center justify-center gap-2 self-start rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? "分析中..." : "開始評估"}
                  {!loading && (
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </section>
            )}

            {stage === "asking" && (
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm text-foreground/60">
                    <span>
                      第 {currentQuestion} 題／共 {TOTAL_QUESTIONS} 題
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-6 shadow-sm">
                  {history.map((turn, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-2 ${
                        turn.role === "assistant" ? "items-start" : "items-end"
                      }`}
                    >
                      <div
                        className={
                          turn.role === "assistant"
                            ? "rounded-2xl rounded-tl-sm bg-blush-soft px-4 py-2.5 text-sm text-foreground"
                            : "rounded-2xl rounded-tr-sm bg-foreground px-4 py-2.5 text-sm text-background"
                        }
                      >
                        {turn.content}
                      </div>
                      {turn.visualAid === "body-condition" && (
                        <div className="w-full max-w-sm rounded-2xl border border-line bg-background p-3">
                          <BodyConditionGuide />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="請輸入你的回答..."
                  className={`resize-none ${FIELD_CLASS}`}
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {loading
                    ? "處理中..."
                    : currentQuestion >= TOTAL_QUESTIONS
                      ? "送出並計算熱量"
                      : "送出回答"}
                </button>
              </section>
            )}

            {stage === "result" && result && (
              <section className="flex flex-col gap-6 rounded-3xl border border-line bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-foreground/60">每日建議熱量</span>
                  <span className="font-display text-5xl font-black text-blush">
                    {result.dailyCalories}
                    <span className="text-xl text-foreground/40"> 大卡/天</span>
                  </span>
                  {result.lifeStage && (
                    <span className="mt-2 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-foreground">
                      {result.lifeStage}
                    </span>
                  )}
                </div>

                {result.basis && (
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {result.basis}
                  </p>
                )}

                {result.activityRecommendation && (
                  <div className="rounded-2xl bg-blush-soft p-4">
                    <h2 className="mb-1.5 flex items-center gap-1.5 text-sm font-black text-foreground">
                      <Activity size={16} className="text-blush" />
                      建議活動量
                    </h2>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {result.activityRecommendation}
                    </p>
                  </div>
                )}

                {result.feedingGuidelines.length > 0 && (
                  <div>
                    <h2 className="mb-2 text-sm font-black text-foreground">飲食建議</h2>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {result.feedingGuidelines.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <PawPrint className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blush" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.nutrientNotes.length > 0 && (
                  <div>
                    <h2 className="mb-2 text-sm font-black text-foreground">
                      營養素重點（依 AAFCO 標準）
                    </h2>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {result.nutrientNotes.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <PawPrint className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.foodSuggestions.length > 0 && (
                  <div>
                    <h2 className="mb-3 flex items-center gap-1.5 text-sm font-black text-foreground">
                      <Utensils size={16} className="text-gold" />
                      飼料份量建議（台灣網購可購得，官網標示符合 AAFCO 標準）
                    </h2>
                    <div className="flex flex-col gap-3">
                      {result.foodSuggestions.map((s, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-line bg-background p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-foreground">
                              {s.brand}
                              {s.productType && (
                                <span className="ml-1.5 font-normal text-foreground/60">
                                  · {s.productType}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-foreground">
                              {s.form === "wet" ? "濕糧" : "乾糧"}
                            </span>
                          </div>
                          {s.dailyPortion && (
                            <p className="mt-1.5 text-sm font-bold text-blush">
                              {s.dailyPortion}
                            </p>
                          )}
                          {s.note && (
                            <p className="mt-1 text-xs text-foreground/60">{s.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.cautions.length > 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-foreground/25 bg-background p-4">
                    <h2 className="mb-2 flex items-center gap-1.5 text-sm font-black text-foreground">
                      <AlertTriangle size={16} className="text-blush" />
                      注意事項
                    </h2>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {result.cautions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <PawPrint className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blush" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-foreground/50">
                  本建議依 AAFCO 與 NRC 標準估算，僅供參考，並非獸醫診斷或處方，實際飲食調整請諮詢專業獸醫師。
                </p>

                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 self-start rounded-full border-2 border-foreground/20 bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-foreground/40"
                >
                  <RotateCcw size={14} />
                  重新開始
                </button>
              </section>
            )}

            {stage === "result" && result && (
              <RecordsPromoCard dailyCalories={result.dailyCalories} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
