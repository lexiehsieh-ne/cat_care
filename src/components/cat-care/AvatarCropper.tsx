"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropToFile } from "./cropImage";
import { errorMessage } from "./api";
import { Button, ErrorBanner } from "./ui";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

// 裁切大頭照的視窗：拖曳移動、滑桿／按鈕／滾輪／雙指縮放，圓形框、輸出正方形
export function AvatarCropper({
  src,
  fileName,
  onDone,
  onCancel,
}: {
  src: string;
  fileName: string;
  onDone: (file: File) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    cancelRef.current = onCancel;
  }, [onCancel]);

  // 開啟時：Esc 取消、鎖住背景捲動、把焦點移進視窗（只在開啟時設定一次）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cancelRef.current();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  const setZoomClamped = (z: number) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100)));

  async function confirm() {
    if (!area) return;
    setPending(true);
    setError(null);
    try {
      onDone(await cropToFile(src, area, fileName));
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={onCancel}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="裁切大頭照"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-dvh w-full flex-col gap-4 rounded-t-2xl bg-card p-4 shadow-xl outline-none sm:max-w-md sm:rounded-2xl sm:p-5"
      >
        <div>
          <h2 className="text-lg font-black">裁切大頭照</h2>
          <p className="text-sm text-foreground/60">拖曳調整位置，用滑桿、滾輪或雙指縮放</p>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" aria-label="縮小" onClick={() => setZoomClamped(zoom - 0.2)} disabled={zoom <= MIN_ZOOM} className="w-11 text-lg">
            −
          </Button>
          <input
            type="range"
            aria-label="縮放"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-11 flex-1 accent-gold"
          />
          <Button variant="ghost" aria-label="放大" onClick={() => setZoomClamped(zoom + 0.2)} disabled={zoom >= MAX_ZOOM} className="w-11 text-lg">
            +
          </Button>
          <span className="w-12 text-right text-sm tabular-nums text-foreground/60">{zoom.toFixed(1)}×</span>
        </div>

        <ErrorBanner message={error} />
        <div className="flex justify-end gap-2 pb-[env(safe-area-inset-bottom)]">
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            取消
          </Button>
          <Button onClick={confirm} disabled={!area || pending}>
            {pending ? "處理中…" : "確定"}
          </Button>
        </div>
      </div>
    </div>
  );
}
