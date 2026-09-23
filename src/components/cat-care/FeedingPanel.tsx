"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { FOOD_TYPES, type FoodType } from "@/lib/cat-constants";
import { API_KEY_HEADER } from "@/lib/constants";
import { useApiKey } from "@/lib/use-api-key";
import {
  api,
  dayKey,
  errorMessage,
  formatDay,
  formatTime,
  fromLocalInput,
  toLocalInput,
  useList,
  type Cat,
  type FeedingRecord,
  type User,
} from "./api";
import { Button, ErrorBanner, Field, inputClass } from "./ui";

type FormValues = { fedAt: string; foodType: FoodType; brand: string; foodName: string; amountGrams: string; note: string };

const emptyValues = (): FormValues => ({
  fedAt: toLocalInput(),
  foodType: FOOD_TYPES[0],
  brand: "",
  foodName: "",
  amountGrams: "",
  note: "",
});

const toPayload = (v: FormValues) => ({
  fedAt: fromLocalInput(v.fedAt),
  foodType: v.foodType,
  brand: v.brand,
  foodName: v.foodName,
  amountGrams: Number(v.amountGrams),
  note: v.note,
});

// 只加總查到熱量的紀錄；有沒查到的就註明筆數
function kcalSummary(records: FeedingRecord[]) {
  const known = records.filter((r) => r.kcal != null);
  if (known.length === 0) return null;
  const total = known.reduce((sum, r) => sum + (r.kcal ?? 0), 0);
  const unknown = records.length - known.length;
  return `約 ${total} 大卡${unknown ? `（${unknown} 筆未查到）` : ""}`;
}

function FeedingForm({ onSubmit }: { onSubmit: (values: FormValues) => Promise<void> }) {
  const [values, setValues] = useState(emptyValues);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit(values);
      setValues(emptyValues());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="時間" className="col-span-2">
          <input type="datetime-local" required value={values.fedAt} onChange={(e) => set("fedAt", e.target.value)} className={inputClass} />
        </Field>
        <Field label="種類">
          <select value={values.foodType} onChange={(e) => set("foodType", e.target.value as FoodType)} className={inputClass}>
            {FOOD_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="份量（g）">
          <input
            type="number"
            required
            min={0}
            step={1}
            inputMode="numeric"
            value={values.amountGrams}
            onChange={(e) => set("amountGrams", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="品牌" className="col-span-2">
          <input value={values.brand} maxLength={50} placeholder="例如：Royal Canin 法國皇家" onChange={(e) => set("brand", e.target.value)} className={inputClass} />
        </Field>
        <Field label="品名" className="col-span-2">
          <input value={values.foodName} maxLength={50} placeholder="例如：室內成貓乾糧" onChange={(e) => set("foodName", e.target.value)} className={inputClass} />
        </Field>
        <Field label="備註" className="col-span-2 sm:col-span-4">
          <input value={values.note} maxLength={200} placeholder="例如：吃光光" onChange={(e) => set("note", e.target.value)} className={inputClass} />
        </Field>
      </div>
      <ErrorBanner message={error} />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : "新增"}
        </Button>
      </div>
    </form>
  );
}

// 每筆紀錄下方的熱量說明：查到／手動填的熱量、查詢中、查不到，以及查詢和手動填寫的按鈕
const linkButton = "min-h-8 font-bold text-blush underline underline-offset-2 hover:opacity-80 pointer-coarse:min-h-11";

function CalorieLine({
  record,
  canEdit,
  canLookup,
  lookingUp,
  message,
  onLookup,
  onSaveManual,
}: {
  record: FeedingRecord;
  canEdit: boolean;
  canLookup: boolean;
  lookingUp: boolean;
  message?: string;
  onLookup: () => void;
  onSaveManual: (kcalPer100g: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setValue(record.kcalPer100g != null ? String(record.kcalPer100g) : "");
    setError(null);
    setEditing(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSaveManual(Number(value));
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (lookingUp) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-foreground/60">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        正在上網查詢官方標示熱量…
      </p>
    );
  }

  if (editing) {
    const preview = Number(value) > 0 ? Math.round((record.amountGrams * Number(value)) / 100) : null;
    return (
      <form onSubmit={save} className="flex flex-col gap-1.5 rounded-xl bg-background p-3 text-xs text-foreground/70">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5">
            每 100g
            <input
              type="number"
              required
              min={1}
              max={900}
              step="0.1"
              inputMode="decimal"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-24 rounded-lg border border-line bg-card px-2 py-1.5 text-base text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold-soft"
            />
            大卡
          </label>
          {preview !== null && <span className="font-bold text-blush">→ 這餐 {record.amountGrams}g ≈ {preview} 大卡</span>}
        </div>
        <p className="text-foreground/50">包裝標示 kcal/kg 的話，除以 10 就是每 100g 的熱量。</p>
        {error && <p className="text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
            取消
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "儲存中…" : "儲存"}
          </Button>
        </div>
      </form>
    );
  }

  if (record.kcal != null) {
    return (
      <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-foreground/60">
        <span>
          {record.calorieManual ? "手動填寫・" : record.calorieProduct ? `對應產品：${record.calorieProduct}・` : ""}每 100g {record.kcalPer100g} 大卡
        </span>
        {record.calorieSource && (
          <a
            href={record.calorieSource}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground"
          >
            官方出處
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {canEdit && (
          <button type="button" onClick={startEditing} className={linkButton}>
            修改
          </button>
        )}
      </p>
    );
  }

  if (!canEdit && !record.brand) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 text-xs text-foreground/60">
      {record.brand && <span>{message ?? "尚未查詢熱量"}</span>}
      {record.brand && canLookup && (
        <button type="button" onClick={onLookup} className={linkButton}>
          {message ? "再查一次" : "查詢熱量"}
        </button>
      )}
      {canEdit && (
        <button type="button" onClick={startEditing} className={linkButton}>
          手動填寫熱量
        </button>
      )}
    </p>
  );
}

export function FeedingPanel({ cat, user }: { cat: Cat; user: User }) {
  const { items, error, reload } = useList<FeedingRecord>(`/api/feeding-records?catId=${cat._id}&limit=200`);
  const [actionError, setActionError] = useState<string | null>(null);
  // BYOK：用登入者自己存在瀏覽器的 OpenAI API Key 上網查熱量；沒有 Key 就不查
  const apiKey = useApiKey();
  const [lookingUp, setLookingUp] = useState<Set<string>>(() => new Set());
  const [lookupMessages, setLookupMessages] = useState<Record<string, string>>({});

  async function lookupCalories(id: string) {
    if (!apiKey) return;
    setLookingUp((s) => new Set(s).add(id));
    setLookupMessages((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });
    try {
      const { found } = await api<{ found: boolean }>(`/api/feeding-records/${id}/calories`, {
        method: "POST",
        headers: { [API_KEY_HEADER]: apiKey },
      });
      if (!found) setLookupMessages((m) => ({ ...m, [id]: "查不到這個產品的官方熱量" }));
      await reload();
    } catch (err) {
      setLookupMessages((m) => ({ ...m, [id]: errorMessage(err) }));
    } finally {
      setLookingUp((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function saveManualCalories(id: string, kcalPer100g: number) {
    await api(`/api/feeding-records/${id}/calories`, { method: "PATCH", body: { kcalPer100g } });
    setLookupMessages((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });
    await reload();
  }

  async function create(values: FormValues) {
    const record = await api<FeedingRecord>("/api/feeding-records", { method: "POST", body: { cat: cat._id, ...toPayload(values) } });
    await reload();
    // 紀錄先存好；有品牌就在背景查熱量，不擋住表單
    if (record.brand) void lookupCalories(record._id);
  }

  async function remove(r: FeedingRecord) {
    if (!confirm(`確定要刪除 ${formatDay(r.fedAt)} ${formatTime(r.fedAt)} 的「${r.foodType}」紀錄嗎？`)) return;
    setActionError(null);
    try {
      await api(`/api/feeding-records/${r._id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  const groups = new Map<string, FeedingRecord[]>();
  for (const r of items ?? []) {
    const key = dayKey(r.fedAt);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const today = groups.get(dayKey(new Date().toISOString())) ?? [];
  const todayTotal = today.reduce((sum, r) => sum + r.amountGrams, 0);
  const todayKcal = kcalSummary(today);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-line bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-black">新增飲食紀錄</h2>
          <p className="text-sm text-foreground/60">
            今天吃了 {today.length} 次，共 <span className="font-semibold text-blush">{todayTotal}g</span>
            {todayKcal && <span className="font-semibold text-blush">・{todayKcal}</span>}
          </p>
        </div>
        <p className="mb-4 rounded-xl bg-gold-soft/60 px-3 py-2 text-xs leading-5 text-foreground/80">
          {apiKey ? (
            <>🔍 填寫品牌後按新增，會自動上網查詢官方標示熱量，算出這餐吃了多少大卡。</>
          ) : (
            <>
              🔍 想自動算出每餐熱量？先
              <Link href="/calculator/start#api-key" className="mx-1 font-bold underline underline-offset-2">
                設定你的 OpenAI API Key
              </Link>
              ，再填寫品牌就會自動查詢。
            </>
          )}
        </p>
        <FeedingForm onSubmit={create} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-black">飲食紀錄</h2>
        <ErrorBanner message={error ?? actionError} />
        {items === null && !error && <p className="text-sm text-foreground/60">載入中…</p>}
        {items?.length === 0 && <p className="text-sm text-foreground/60">還沒有紀錄，從上面新增第一筆吧。</p>}

        {/* 桌面版每天的紀錄兩欄排列，手機版單欄 */}
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          {[...groups.entries()].map(([key, records]) => {
            const dayKcal = kcalSummary(records);
            return (
              <div key={key} className="overflow-hidden rounded-3xl border border-line bg-card">
                <div className="flex flex-wrap items-center justify-between gap-x-3 bg-background px-4 py-2 text-sm">
                  <span className="font-medium">{formatDay(records[0].fedAt)}</span>
                  <span className="text-foreground/60">
                    共 {records.reduce((s, r) => s + r.amountGrams, 0)}g{dayKcal && `・${dayKcal}`}
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {records.map((r) => (
                    <li key={r._id} className="flex flex-col gap-1 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="w-12 font-mono text-sm text-foreground/60">{formatTime(r.fedAt)}</span>
                        <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-foreground">
                          {r.foodType}
                        </span>
                        {/* 手機版名稱獨立一行；平板以上和其他欄位排在同一行 */}
                        <span className="order-3 min-w-0 basis-full break-words sm:order-none sm:flex-1 sm:basis-0">
                          {r.brand && <span className="mr-1 font-bold">{r.brand}</span>}
                          {r.foodName || (!r.brand && <span className="text-foreground/40">（未填品名）</span>)}
                          {r.note && <span className="ml-2 text-sm text-foreground/60">· {r.note}</span>}
                        </span>
                        <span className="ml-auto text-right tabular-nums sm:ml-0">
                          <span className="font-semibold">{r.amountGrams}g</span>
                          {r.kcal != null && <span className="ml-2 text-sm font-bold text-blush">≈ {r.kcal} 大卡</span>}
                        </span>
                        {/* 只有寫下這筆紀錄的人可以刪除 */}
                        <span className="order-4 -my-1 flex basis-full items-center justify-end gap-1 sm:order-none sm:my-0 sm:basis-auto">
                          {r.createdBy._id === user._id ? (
                            <Button variant="danger" onClick={() => remove(r)}>
                              刪除
                            </Button>
                          ) : (
                            <span className="px-3 text-xs text-foreground/40">{r.createdBy.name} 記錄</span>
                          )}
                        </span>
                      </div>
                      <div className="sm:pl-15">
                        <CalorieLine
                          record={r}
                          canEdit={r.createdBy._id === user._id}
                          canLookup={Boolean(apiKey) && r.createdBy._id === user._id}
                          lookingUp={lookingUp.has(r._id)}
                          message={lookupMessages[r._id]}
                          onLookup={() => lookupCalories(r._id)}
                          onSaveManual={(k) => saveManualCalories(r._id, k)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
