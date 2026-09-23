import type { Area } from "react-easy-crop";

const OUTPUT_SIZE = 512; // 大頭照輸出尺寸（正方形）

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("圖片讀取失敗"));
    img.src = src;
  });
}

// 依裁切範圍（原圖像素）畫到 512×512 的 canvas，輸出成 JPEG 檔
export async function cropToFile(imageSrc: string, area: Area, originalName: string): Promise<File> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("瀏覽器不支援圖片裁切");

  // JPEG 沒有透明：先鋪白底，避免透明 PNG 變黑
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("圖片裁切失敗");
  const baseName = originalName.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${baseName}-avatar.jpg`, { type: "image/jpeg" });
}
