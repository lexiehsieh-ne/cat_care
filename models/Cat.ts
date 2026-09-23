import { Schema, deleteModel, model, models, type InferSchemaType } from "mongoose";
import { CAT_GENDERS } from "@/lib/cat-constants";

// 只保存第一次登記時填寫的基本資料
const catSchema = new Schema(
  {
    // 每隻貓只屬於一位使用者
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 30 },
    breed: { type: String, required: true, trim: true, maxlength: 30 },
    gender: { type: String, enum: CAT_GENDERS, required: true },
    age: { type: String, required: true, trim: true, maxlength: 20 },
    // 大頭照：Vercel Blob 的公開網址，只由 /api/cats/:id/avatar 寫入
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

// API 回傳給前端的欄位
export const CAT_FIELDS = "owner name breed gender age avatarUrl";

// 最常見的查詢是「某位使用者的貓」
catSchema.index({ owner: 1, createdAt: 1 });

export type Cat = InferSchemaType<typeof catSchema>;

// 開發模式 HMR 重新載入時先移除舊 model，讓修改後的 schema 生效，也避免 OverwriteModelError
if (models.Cat) deleteModel("Cat");
export const CatModel = model<Cat>("Cat", catSchema);
