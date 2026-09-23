"use client";

import { useEffect, useId, useRef, useState } from "react";
import { errorMessage, uploadAvatar, type Cat } from "./api";
import { AvatarCropper } from "./AvatarCropper";
import { Button, ErrorBanner } from "./ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
// 原圖上限；裁切後會輸出 512×512 JPEG（通常 100KB 內），遠小於伺服器的 4MB 上限
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

// 本機預覽用的網址；換檔或元件卸載時釋放
function usePreviewUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 需要在 effect 裡建立並在 cleanup 釋放 object URL
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [file]);
  return file ? url : null;
}

type Source = { file: File; url: string };

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

// 圓形大頭照；沒有照片時顯示貓咪圖示
export function CatAvatar({ src, name, className = "size-16 text-3xl" }: { src?: string | null; name: string; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gold-soft/50 ${className}`}
    >
      {/* Blob 公開網址或本機 blob: 預覽，直接用 img 顯示 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={`${name} 的大頭照`} className="size-full object-cover" /> : <span aria-hidden>🐱</span>}
    </span>
  );
}

// 選擇圖片＋預覽；不負責上傳。current 是目前的大頭照（還沒選新檔時顯示）
export function PhotoPicker({
  file,
  onChange,
  disabled,
  current,
  name = "貓咪",
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  current?: string;
  name?: string;
}) {
  const inputId = useId();
  const preview = usePreviewUrl(file);
  const [error, setError] = useState<string | null>(null);
  // original：目前這張裁切結果的原圖（可「重新裁切」）；candidate：裁切視窗正在處理的原圖
  const [original, setOriginal] = useState<Source | null>(null);
  const [candidate, setCandidate] = useState<Source | null>(null);
  const liveUrls = useRef(new Set<string>());

  const makeSource = (f: File): Source => {
    const url = URL.createObjectURL(f);
    liveUrls.current.add(url);
    return { file: f, url };
  };
  const release = (s: Source | null) => {
    if (s && liveUrls.current.delete(s.url)) URL.revokeObjectURL(s.url);
  };
  // 元件卸載時釋放所有還在用的預覽網址
  useEffect(() => {
    const urls = liveUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) return setError("只支援 JPG、PNG、WebP、GIF 圖片");
    if (f.size > MAX_SOURCE_BYTES) return setError(`圖片太大（${formatSize(f.size)}），請小於 20MB`);
    setCandidate(makeSource(f));
  }

  function clear() {
    release(original);
    setOriginal(null);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <CatAvatar src={preview ?? current} name={name} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-background has-focus-visible:ring-2 has-focus-visible:ring-gold-soft sm:min-h-9 sm:pointer-coarse:min-h-11 ${
                disabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {file ? "換一張" : current ? "更換照片" : "選擇照片"}
              <input
                id={inputId}
                type="file"
                accept={ACCEPT}
                disabled={disabled}
                className="sr-only"
                onChange={(e) => {
                  pick(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {file && original && (
              <Button variant="ghost" onClick={() => setCandidate(original)} disabled={disabled}>
                重新裁切
              </Button>
            )}
            {file && (
              <Button variant="ghost" onClick={clear} disabled={disabled}>
                取消
              </Button>
            )}
          </div>
          <p className="truncate text-xs text-foreground/60">
            {file ? `已裁切成 512×512（${formatSize(file.size)}）` : "JPG、PNG、WebP、GIF，20MB 以內，選好後可以裁切"}
          </p>
        </div>
      </div>
      <ErrorBanner message={error} />
      {candidate && (
        <AvatarCropper
          src={candidate.url}
          fileName={candidate.file.name}
          onDone={(cropped) => {
            if (original !== candidate) release(original);
            setOriginal(candidate);
            setCandidate(null);
            onChange(cropped);
          }}
          onCancel={() => {
            // 取消：保留上一次的裁切結果，丟掉這次選的新圖
            if (candidate !== original) release(candidate);
            setCandidate(null);
          }}
        />
      )}
    </div>
  );
}

// 「選擇貓咪」區塊裡：顯示並更換目前這隻貓的大頭照（網址存進資料庫）
export function CatAvatarUpload({ cat, onUpdated }: { cat: Cat; onUpdated: (cat: Cat) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function upload() {
    if (!file) return;
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await uploadAvatar(cat._id, file);
      setFile(null);
      setSaved(true);
      onUpdated(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground/70">「{cat.name}」的大頭照</h3>
      <PhotoPicker
        file={file}
        onChange={(f) => {
          setFile(f);
          setSaved(false);
        }}
        disabled={pending}
        current={cat.avatarUrl}
        name={cat.name}
      />
      <ErrorBanner message={error} />
      {saved && (
        <p role="status" className="text-sm text-emerald-700">
          ✓ 大頭照已更新
        </p>
      )}
      {file && (
        <div className="flex justify-end">
          <Button onClick={upload} disabled={pending}>
            {pending ? "上傳中…" : "設為大頭照"}
          </Button>
        </div>
      )}
    </div>
  );
}
