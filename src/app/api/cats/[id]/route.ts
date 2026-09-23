import type { NextRequest } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { requireUser } from "@/lib/current-user";
import { handleError, isObjectId, jsonError, pick, readJson } from "@/lib/http";
import { CAT_FIELDS, CatModel } from "@/models/Cat";

// owner 不能透過這裡修改
const WRITABLE_FIELDS = ["name", "breed", "gender", "age"] as const;

// PATCH /api/cats/:id（只更新有傳的欄位；只有主人能改）
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/cats/[id]">) {
  try {
    const { id } = await ctx.params;
    if (!isObjectId(id)) return jsonError(400, "id 格式不正確");

    const body = await readJson(request);
    if (!body) return jsonError(400, "請傳入 JSON 物件");
    const update = pick(body, WRITABLE_FIELDS);
    if (Object.keys(update).length === 0) return jsonError(400, "沒有可更新的欄位");

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    // 條件包含 owner：別人的貓和不存在的貓一樣回 404，不透露它存在
    const updated = await CatModel.findOneAndUpdate({ _id: id, owner: userId }, update, { returnDocument: "after", runValidators: true })
      .select(CAT_FIELDS)
      .lean();
    if (!updated) return jsonError(404, "找不到這隻貓");
    return Response.json(updated);
  } catch (err) {
    return handleError(err);
  }
}
