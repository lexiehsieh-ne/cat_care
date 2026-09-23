import { Schema, deleteModel, model, models, type InferSchemaType } from "mongoose";

const weightRecordSchema = new Schema(
  {
    // 每筆體重紀錄只屬於一隻貓：存 Cat 的 _id
    cat: { type: Schema.Types.ObjectId, ref: "Cat", required: true },
    // 寫下這筆紀錄的使用者；只有他能刪除
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    measuredAt: { type: Date, required: true, default: Date.now },
    // 用公克存整數，幼貓的體重變化比較看得出來，也避免小數誤差
    weightGrams: { type: Number, required: true, min: 1, max: 20000 },
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true },
);

// 最常見的查詢是「某隻貓的體重變化，依時間排序」
weightRecordSchema.index({ cat: 1, measuredAt: -1 });

export type WeightRecord = InferSchemaType<typeof weightRecordSchema>;

// 開發模式 HMR 重新載入時先移除舊 model，讓修改後的 schema 生效，也避免 OverwriteModelError
if (models.WeightRecord) deleteModel("WeightRecord");
export const WeightRecordModel = model<WeightRecord>("WeightRecord", weightRecordSchema);
