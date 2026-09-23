import "server-only";
import { createOpenAIClient } from "@/lib/openai";
import { FoodCalorieModel } from "@/models/FoodCalorie";

// 網路搜尋需要支援 web_search 工具的模型
const SEARCH_MODEL = process.env.FOOD_SEARCH_MODEL ?? "gpt-4.1-mini";

// 貓食每 100g 熱量的合理範圍（濕食約 70～130、乾糧約 300～450、零食可能更高）；超出就當作查錯
const MIN_KCAL_PER_100G = 20;
const MAX_KCAL_PER_100G = 700;

export type FoodQuery = { brand: string; foodName: string; foodType: string };

export type FoodCalorieInfo = {
  kcalPer100g: number;
  productName: string;
  sourceUrl: string;
};

const normalize = (text: string) => text.toLowerCase().replace(/[\s·・,，.。\-_/()（）]+/g, "");

function cacheKey({ brand, foodName, foodType }: FoodQuery) {
  return [normalize(brand), normalize(foodName), foodType].join("|");
}

const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["found", "kcalPer100g", "productName", "sourceUrl", "basis"],
  properties: {
    found: { type: "boolean", description: "是否找到可信的官方熱量標示" },
    kcalPer100g: { type: "number", description: "每 100 公克的熱量（kcal）；找不到時填 0" },
    productName: { type: "string", description: "實際對應到的產品完整名稱" },
    sourceUrl: { type: "string", description: "熱量數據出處網址；找不到時填空字串" },
    basis: { type: "string", description: "一句話說明數據來源與換算方式" },
  },
} as const;

type SearchResult = { found: boolean; kcalPer100g: number; productName: string; sourceUrl: string; basis: string };

// 先查快取；沒有才用使用者自己的 API Key 上網搜尋官方標示熱量。查不到回傳 null
export async function lookupFoodCalorie(apiKey: string, query: FoodQuery): Promise<FoodCalorieInfo | null> {
  const key = cacheKey(query);
  const cached = await FoodCalorieModel.findOne({ key }).lean();
  if (cached) return { kcalPer100g: cached.kcalPer100g, productName: cached.productName, sourceUrl: cached.sourceUrl };

  const openai = createOpenAIClient(apiKey);
  const product = [query.brand, query.foodName].filter(Boolean).join(" ");
  const response = await openai.responses.create({
    model: SEARCH_MODEL,
    tools: [{ type: "web_search" }],
    temperature: 0,
    input: [
      {
        role: "system",
        content: `你是寵物食品營養資料查核員。請上網搜尋指定貓咪食品的「官方標示熱量」（代謝能 ME），回報每 100 公克的熱量。
規則：
- 優先採用品牌官網的產品頁；其次是品牌官方授權通路或包裝標示的內容。不要採用論壇、部落格或他人估算的數字。
- 同一品牌有多款產品時，選最符合品名與種類的那一款：品名裡的關鍵字（例如幼貓、成貓、熟齡、絕育、室內、體重控制、口味）都要相符，不要換成同品牌的其他系列。
- 品名不明確時選該品牌最常見、最符合種類的產品；productName 一律寫出實際採用的產品完整名稱。
- 單位換算：kcal/kg 除以 10；只標示每罐／每包熱量時，用淨重換算成每 100g；kJ 除以 4.184 換成 kcal。
- 找不到可信的官方數據時，found 設為 false、kcalPer100g 填 0，不要猜測。`,
      },
      { role: "user", content: `品牌與品名：${product}\n食物種類：${query.foodType}` },
    ],
    text: { format: { type: "json_schema", name: "food_calorie", strict: true, schema: RESULT_SCHEMA } },
  });

  const result = JSON.parse(response.output_text) as SearchResult;
  const kcal = Math.round(result.kcalPer100g * 10) / 10;
  if (!result.found || !(kcal >= MIN_KCAL_PER_100G && kcal <= MAX_KCAL_PER_100G)) return null;

  const info = { kcalPer100g: kcal, productName: result.productName, sourceUrl: result.sourceUrl };
  // 兩個請求同時查同一個產品時，後寫入的直接覆蓋，不會重複建立
  await FoodCalorieModel.updateOne(
    { key },
    { $set: { ...info, ...query, basis: result.basis } },
    { upsert: true },
  );
  return info;
}
