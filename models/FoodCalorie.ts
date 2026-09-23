import { Schema, deleteModel, model, models, type InferSchemaType } from "mongoose";

// 查過的食品熱量快取：同一個品牌＋品名＋種類只上網查一次，之後直接用
// 產品熱量是公開資訊，所有使用者共用
const foodCalorieSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    foodName: { type: String, default: "" },
    foodType: { type: String, required: true },
    kcalPer100g: { type: Number, required: true, min: 0 },
    productName: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    basis: { type: String, default: "" },
  },
  { timestamps: true },
);

export type FoodCalorie = InferSchemaType<typeof foodCalorieSchema>;

if (models.FoodCalorie) deleteModel("FoodCalorie");
export const FoodCalorieModel = model<FoodCalorie>("FoodCalorie", foodCalorieSchema);
