"use client";

import { useState, type FormEvent } from "react";
import {
  api,
  errorMessage,
  formatDay,
  formatKg,
  formatTime,
  fromLocalInput,
  toLocalInput,
  useList,
  type Cat,
  type User,
  type WeightRecord,
} from "./api";
import { Button, ErrorBanner, Field, inputClass } from "./ui";
import { WeightChart } from "./WeightChart";

type FormValues = { measuredAt: string; weightKg: string; note: string };

const emptyValues = (): FormValues => ({ measuredAt: toLocalInput(), weightKg: "", note: "" });

const toPayload = (v: FormValues) => ({
  measuredAt: fromLocalInput(v.measuredAt),
  // 畫面輸入公斤，存回資料庫時換成公克
  weightGrams: Math.round(Number(v.weightKg) * 1000),
  note: v.note,
});

function WeightForm({ onSubmit }: { onSubmit: (values: FormValues) => Promise<void> }) {
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
          <input type="datetime-local" required value={values.measuredAt} onChange={(e) => set("measuredAt", e.target.value)} className={inputClass} />
        </Field>
        <Field label="體重（kg）" className="col-span-2">
          <input
            type="number"
            required
            min={0.01}
            max={20}
            step={0.01}
            inputMode="decimal"
            placeholder="例如：4.25"
            value={values.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="備註" className="col-span-2 sm:col-span-4">
          <input value={values.note} maxLength={200} placeholder="例如：吃飽後量" onChange={(e) => set("note", e.target.value)} className={inputClass} />
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

function Delta({ grams }: { grams: number | null }) {
  if (grams === null) return <span className="text-xs text-foreground/40">第一筆</span>;
  const color =
    grams > 0 ? "text-emerald-700" : grams < 0 ? "text-red-600" : "text-foreground/60";
  return (
    <span className={`text-sm tabular-nums ${color}`}>
      {grams > 0 ? "▲" : grams < 0 ? "▼" : "–"} {formatKg(Math.abs(grams))}
    </span>
  );
}

export function WeightPanel({ cat, user }: { cat: Cat; user: User }) {
  const { items, error, reload } = useList<WeightRecord>(`/api/weight-records?catId=${cat._id}&limit=200`);
  const [actionError, setActionError] = useState<string | null>(null);

  async function create(values: FormValues) {
    await api("/api/weight-records", { method: "POST", body: { cat: cat._id, ...toPayload(values) } });
    await reload();
  }

  async function remove(r: WeightRecord) {
    if (!confirm(`確定要刪除 ${formatDay(r.measuredAt)} 的體重紀錄（${formatKg(r.weightGrams)}）嗎？`)) return;
    setActionError(null);
    try {
      await api(`/api/weight-records/${r._id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  // 列表是新到舊，和下一筆（較舊的）比較就是這次的變化
  const records = items ?? [];
  const deltaAt = (i: number) => (i + 1 < records.length ? records[i].weightGrams - records[i + 1].weightGrams : null);
  const latest = records[0];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-line bg-card p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-black">新增體重紀錄</h2>
        <WeightForm onSubmit={create} />
      </section>

      {/* 桌面版左右並排：左邊體重變化、右邊體重紀錄；手機版上下排列 */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="rounded-3xl border border-line bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg font-black">體重變化</h2>
              <p className="text-xs text-foreground/60">單位：公斤（kg）</p>
            </div>
            {latest && (
              <p className="flex items-baseline gap-2 text-sm text-foreground/60">
                目前 <span className="text-base font-semibold text-foreground">{formatKg(latest.weightGrams)}</span>
                <Delta grams={deltaAt(0)} />
              </p>
            )}
          </div>
          {items === null ? <p className="h-32 text-sm text-foreground/60">載入中…</p> : <WeightChart records={records} />}
        </section>

        <section className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            <h2 className="text-lg font-black">體重紀錄</h2>
            <ErrorBanner message={error ?? actionError} />
            {items === null && !error && <p className="text-sm text-foreground/60">載入中…</p>}
            {items?.length === 0 && <p className="text-sm text-foreground/60">還沒有紀錄，從上面新增第一筆吧。</p>}
          </div>

          {records.length > 0 && (
            <ul className="divide-y divide-line border-t border-line">
              {records.map((r, i) => (
                <li key={r._id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                  <span className="w-28 text-sm text-foreground/60">
                    {formatDay(r.measuredAt)} <span className="font-mono">{formatTime(r.measuredAt)}</span>
                  </span>
                  <span className="text-lg font-black tabular-nums">{formatKg(r.weightGrams)}</span>
                  <Delta grams={deltaAt(i)} />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground/60">{r.note}</span>
                  {/* 只有寫下這筆紀錄的人可以刪除 */}
                  <span className="-my-1 flex basis-full items-center justify-end gap-1 sm:my-0 sm:basis-auto">
                    {r.createdBy._id === user._id ? (
                      <Button variant="danger" onClick={() => remove(r)}>
                        刪除
                      </Button>
                    ) : (
                      <span className="px-3 text-xs text-foreground/40">{r.createdBy.name} 記錄</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
