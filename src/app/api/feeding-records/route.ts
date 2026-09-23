import type { NextRequest } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { requireUser } from "@/lib/current-user";
import { handleError, isObjectId, jsonError, pick, readJson } from "@/lib/http";
import { CatModel } from "@/models/Cat";
import { FeedingRecordModel } from "@/models/FeedingRecord";

// createdBy 由伺服器依目前使用者填入，前端不能指定
const WRITABLE_FIELDS = ["cat", "fedAt", "foodType", "brand", "foodName", "amountGrams", "note"] as const;

// GET /api/feeding-records?catId=&from=&to=&limit=（只能看自己的貓）
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const catId = params.get("catId");
    const from = params.get("from");
    const to = params.get("to");
    const limit = Math.min(Math.max(Number(params.get("limit")) || 50, 1), 200);

    if (!isObjectId(catId)) return jsonError(400, "請提供正確的 catId");
    const filter: Record<string, unknown> = { cat: catId };
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      if (Object.values(range).some((d) => Number.isNaN(d.getTime()))) {
        return jsonError(400, "from / to 日期格式不正確");
      }
      filter.fedAt = range;
    }

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;
    // 條件包含 owner：別人的貓和不存在的貓一樣回 404，不透露它存在
    if (!(await CatModel.exists({ _id: catId, owner: userId }))) return jsonError(404, "找不到這隻貓");

    const records = await FeedingRecordModel.find(filter)
      .sort({ fedAt: -1 })
      .limit(limit)
      .populate("cat", "name")
      .populate("createdBy", "name")
      .lean();
    return Response.json(records);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/feeding-records（只能記錄自己的貓）
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body) return jsonError(400, "請傳入 JSON 物件");
    if (!isObjectId(body.cat)) return jsonError(400, "cat 必須是貓咪的 _id");

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    // 條件包含 owner：別人的貓和不存在的貓一樣回 404，不透露它存在
    if (!(await CatModel.exists({ _id: body.cat, owner: userId }))) return jsonError(404, "找不到這隻貓");

    const record = await FeedingRecordModel.create({ ...pick(body, WRITABLE_FIELDS), createdBy: userId });
    await record.populate([
      { path: "cat", select: "name" },
      { path: "createdBy", select: "name" },
    ]);
    return Response.json(record, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
