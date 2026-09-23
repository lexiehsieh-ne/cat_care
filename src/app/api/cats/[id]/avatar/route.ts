import { del, put } from "@vercel/blob";
import type { NextRequest } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { requireUser } from "@/lib/current-user";
import { handleError, isObjectId, jsonError } from "@/lib/http";
import { CAT_FIELDS, CatModel } from "@/models/Cat";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Vercel Serverless Function 的請求上限約 4.5MB，留一點空間給表單其他欄位
const MAX_BYTES = 4 * 1024 * 1024;
// 要和 Vercel Blob Store 的存取設定一致；大頭照要能直接顯示，所以用 public
const ACCESS = process.env.BLOB_ACCESS === "private" ? "private" : "public";

// POST /api/cats/:id/avatar（multipart/form-data：file）
// 上傳到 Vercel Blob → 把公開網址存進 Cat.avatarUrl → 刪掉舊的大頭照
export async function POST(request: NextRequest, ctx: RouteContext<"/api/cats/[id]/avatar">) {
  try {
    const { id } = await ctx.params;
    if (!isObjectId(id)) return jsonError(400, "id 格式不正確");

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    // 條件包含 owner：別人的貓和不存在的貓一樣回 404
    const cat = await CatModel.findOne({ _id: id, owner: userId }).select("avatarUrl").lean();
    if (!cat) return jsonError(404, "找不到這隻貓");

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File) || file.size === 0) return jsonError(400, "請選擇要上傳的圖片");
    if (!ALLOWED_TYPES.includes(file.type)) return jsonError(400, "只支援 JPG、PNG、WebP、GIF 圖片");
    if (file.size > MAX_BYTES) return jsonError(400, "圖片太大，請小於 4MB");

    // addRandomSuffix：每次上傳都是新網址，瀏覽器不會顯示快取的舊圖
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const blob = await put(`cats/${userId}/${id}/avatar.${ext}`, file, {
      access: ACCESS,
      addRandomSuffix: true,
      contentType: file.type,
    });

    const updated = await CatModel.findOneAndUpdate(
      { _id: id, owner: userId },
      { avatarUrl: blob.url },
      { returnDocument: "after" },
    )
      .select(CAT_FIELDS)
      .lean();

    // 舊大頭照已經沒人用了，從 Blob 刪掉；刪除失敗不影響這次上傳
    if (cat.avatarUrl && cat.avatarUrl !== blob.url) {
      await del(cat.avatarUrl).catch((err) => console.error("刪除舊大頭照失敗", err));
    }

    return Response.json(updated, { status: 201 });
  } catch (err) {
    console.error("上傳大頭照失敗", err);
    // 暫時把錯誤訊息一起回傳，方便從瀏覽器 Network 分頁直接看到根本原因；
    // 查完問題後應該把這行改回 return handleError(err);
    if (err instanceof Error) return jsonError(500, "伺服器錯誤", { detail: err.message });
    return handleError(err);
  }
}
