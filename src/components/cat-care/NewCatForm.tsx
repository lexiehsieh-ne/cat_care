"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CAT_GENDERS, type CatGender } from "@/lib/cat-constants";
import { api, errorMessage, uploadAvatar, type Cat } from "./api";
import { PhotoPicker } from "./PhotoUpload";
import { Button, ErrorBanner, Field, inputClass } from "./ui";

type FormValues = { name: string; breed: string; gender: CatGender | ""; age: string };

const emptyValues: FormValues = { name: "", breed: "", gender: "", age: "" };

// 登錄和編輯共用的貓咪表單
function CatForm({
  initial = emptyValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
  extra,
}: {
  initial?: FormValues;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel?: () => void;
  // 額外欄位（例如照片），放在基本資料下方
  extra?: (pending: boolean) => ReactNode;
}) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const radioName = useId();
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.gender) {
      setError("請選擇性別");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit(values);
      if (!onCancel) setValues(emptyValues);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
      <div className="grid grid-cols-2 gap-3">
        <Field label="名字">
          <input required maxLength={30} value={values.name} placeholder="例如：酸辣湯" onChange={(e) => set("name", e.target.value)} className={inputClass} />
        </Field>
        <Field label="品種">
          <input required maxLength={30} value={values.breed} placeholder="例如：米克斯" onChange={(e) => set("breed", e.target.value)} className={inputClass} />
        </Field>
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium text-foreground/70">性別</legend>
          <div className="grid grid-cols-2 gap-2">
            {CAT_GENDERS.map((g) => (
              <label
                key={g}
                className="flex cursor-pointer items-center justify-center rounded-full border border-line bg-card py-2 text-base has-checked:border-gold has-checked:bg-gold-soft/50 has-checked:font-semibold has-checked:text-foreground has-focus-visible:ring-2 has-focus-visible:ring-gold-soft"
              >
                <input type="radio" name={radioName} value={g} checked={values.gender === g} onChange={() => set("gender", g)} className="sr-only" />
                {g}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="年齡">
          <input required maxLength={20} value={values.age} placeholder="例如：約 3 個月" onChange={(e) => set("age", e.target.value)} className={inputClass} />
        </Field>
      </div>
      {extra?.(pending)}
      <ErrorBanner message={error} />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// 新貓咪登錄在目前登入的使用者名下（後端從登入 Cookie 判斷）
// 先建立貓咪，有選大頭照再上傳（網址由後端存進資料庫）；
// 大頭照失敗時貓咪仍然建立，回傳錯誤訊息讓使用者之後再補傳
export function NewCatForm({ onCreated }: { onCreated: (cat: Cat, avatarError: string | null) => void }) {
  const [photo, setPhoto] = useState<File | null>(null);

  return (
    <CatForm
      submitLabel="登錄"
      pendingLabel="登錄中…"
      extra={(pending) => (
        <Field label="大頭照（選填）">
          <PhotoPicker file={photo} onChange={setPhoto} disabled={pending} />
        </Field>
      )}
      onSubmit={async (values) => {
        let cat = await api<Cat>("/api/cats", { method: "POST", body: values });
        let avatarError: string | null = null;
        if (photo) {
          try {
            cat = await uploadAvatar(cat._id, photo);
          } catch (err) {
            avatarError = errorMessage(err);
          }
        }
        setPhoto(null);
        onCreated(cat, avatarError);
      }}
    />
  );
}

// 修改貓咪資料；只有主人能改（後端會檢查）
export function EditCatForm({
  cat,
  onSaved,
  onCancel,
}: {
  cat: Cat;
  onSaved: (cat: Cat) => void;
  onCancel: () => void;
}) {
  return (
    <CatForm
      initial={{ name: cat.name, breed: cat.breed, gender: cat.gender, age: cat.age }}
      submitLabel="儲存"
      pendingLabel="儲存中…"
      onCancel={onCancel}
      onSubmit={async (values) => {
        const updated = await api<Cat>(`/api/cats/${cat._id}`, { method: "PATCH", body: values });
        onSaved(updated);
      }}
    />
  );
}
