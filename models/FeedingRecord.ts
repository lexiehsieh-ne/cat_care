import { Schema, deleteModel, model, models, type InferSchemaType } from "mongoose";
import { FOOD_TYPES } from "@/lib/cat-constants";

const feedingRecordSchema = new Schema(
  {
    // 每筆飲食紀錄只屬於一隻貓：存 Cat 的 _id
    cat: { type: Schema.Types.ObjectId, ref: "Cat", required: true },
    // 寫下這筆紀錄的使用者；只有他能刪除
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fedAt: { type: Date, required: true, default: Date.now },
    foodType: { type: String, enum: FOOD_TYPES, required: true },
    // 品牌＋品名用來上網查官方標示熱量
    brand: { type: String, trim: true, maxlength: 50, default: "" },
    foodName: { type: String, trim: true, maxlength: 50, default: "" },
    amountGrams: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, maxlength: 200, default: "" },
    // 查到或手動填寫的熱量（每 100g）與這餐換算出的卡路里；沒有時維持 null
    kcalPer100g: { type: Number, min: 0, default: null },
    kcal: { type: Number, min: 0, default: null },
    calorieProduct: { type: String, trim: true, maxlength: 200, default: "" },
    calorieSource: { type: String, trim: true, maxlength: 500, default: "" },
    // true = 使用者手動填寫的熱量（不是上網查到的）
    calorieManual: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 最常見的查詢是「某隻貓的飲食紀錄，依時間新到舊」
feedingRecordSchema.index({ cat: 1, fedAt: -1 });

export type FeedingRecord = InferSchemaType<typeof feedingRecordSchema>;

// 開發模式 HMR 重新載入時先移除舊 model，讓修改後的 schema 生效，也避免 OverwriteModelError
if (models.FeedingRecord) deleteModel("FeedingRecord");
export const FeedingRecordModel = model<FeedingRecord>("FeedingRecord", feedingRecordSchema);
