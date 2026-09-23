import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { connectMongoose } from "@/lib/mongoose";
import { requireUser } from "@/lib/current-user";
import { handleError, isObjectId, jsonError, readJson } from "@/lib/http";
import { API_KEY_HEADER } from "@/lib/constants";
import { lookupFoodCalorie } from "@/lib/food-calorie";
import { FeedingRecordModel } from "@/models/FeedingRecord";

// 網路搜尋可能要十幾秒
export const maxDuration = 60;

// POST /api/feeding-records/:id/calories
// 用品牌＋品名上網查官方標示熱量，依這餐的份量算出卡路里並存回紀錄（只能查自己寫的紀錄）
// BYOK：用登入者自己的 OpenAI API Key（放在 header）；注意這裡不能回 401，前端會當成登入過期
export async function POST(request: NextRequest, ctx: RouteContext<"/api/feeding-records/[id]/calories">) {
  try {
    const { id } = await ctx.params;
    if (!isObjectId(id)) return jsonError(400, "id 格式不正確");

    const apiKey = request.headers.get(API_KEY_HEADER)?.trim();
    if (!apiKey) return jsonError(400, "請先設定你的 OpenAI API Key");

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    const record = await FeedingRecordModel.findOne({ _id: id, createdBy: userId });
    if (!record) return jsonError(404, "找不到這筆飲食紀錄");
    if (!record.brand) return jsonError(400, "請先填寫品牌才能查詢熱量");

    const info = await lookupFoodCalorie(apiKey, {
      brand: record.brand,
      foodName: record.foodName,
      foodType: record.foodType,
    });
    if (info) {
      record.kcalPer100g = info.kcalPer100g;
      record.kcal = Math.round((record.amountGrams * info.kcalPer100g) / 100);
      record.calorieProduct = info.productName;
      record.calorieSource = info.sourceUrl;
      record.calorieManual = false;
      await record.save();
    }

    await record.populate([
      { path: "cat", select: "name" },
      { path: "createdBy", select: "name" },
    ]);
    return Response.json({ found: Boolean(info), record });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      console.error("[/api/feeding-records/:id/calories] OpenAI request failed:", err);
      if (err.status === 401) return jsonError(400, "OpenAI API Key 無效，請重新設定");
      if (err.status === 429) return jsonError(429, "OpenAI 額度不足或請求太頻繁，請稍後再試");
      return jsonError(502, "呼叫 OpenAI 查詢熱量時發生錯誤，請稍後再試");
    }
    return handleError(err);
  }
}

// 手動填寫的熱量合理範圍（每 100g）
const MAX_MANUAL_KCAL_PER_100G = 900;

// PATCH /api/feeding-records/:id/calories  body: { kcalPer100g }
// 手動填寫每 100g 熱量（不需要 API Key），依這餐的份量算出卡路里；只能改自己寫的紀錄
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/feeding-records/[id]/calories">) {
  try {
    const { id } = await ctx.params;
    if (!isObjectId(id)) return jsonError(400, "id 格式不正確");

    const body = await readJson(request);
    const kcalPer100g = Number(body?.kcalPer100g);
    if (!(kcalPer100g > 0 && kcalPer100g <= MAX_MANUAL_KCAL_PER_100G)) {
      return jsonError(400, `每 100g 熱量請填 1～${MAX_MANUAL_KCAL_PER_100G} 之間的數字`);
    }

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    const record = await FeedingRecordModel.findOne({ _id: id, createdBy: userId });
    if (!record) return jsonError(404, "找不到這筆飲食紀錄");

    record.kcalPer100g = Math.round(kcalPer100g * 10) / 10;
    record.kcal = Math.round((record.amountGrams * record.kcalPer100g) / 100);
    record.calorieProduct = "";
    record.calorieSource = "";
    record.calorieManual = true;
    await record.save();

    await record.populate([
      { path: "cat", select: "name" },
      { path: "createdBy", select: "name" },
    ]);
    return Response.json(record);
  } catch (err) {
    return handleError(err);
  }
}
