// 前後端共用的選項；這個檔案不能 import mongoose 或 server-only 的東西
export const CAT_GENDERS = ["公", "母"] as const;
export const FOOD_TYPES = ["乾飼料", "濕食", "罐頭", "生食", "零食", "其他"] as const;

export type CatGender = (typeof CAT_GENDERS)[number];
export type FoodType = (typeof FOOD_TYPES)[number];
