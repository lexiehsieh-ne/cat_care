import type { NextRequest } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { requireUser } from "@/lib/current-user";
import { handleError, isObjectId, jsonError } from "@/lib/http";
import { FeedingRecordModel } from "@/models/FeedingRecord";

// DELETE /api/feeding-records/:id（只能刪除自己寫的紀錄）
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/feeding-records/[id]">) {
  try {
    const { id } = await ctx.params;
    if (!isObjectId(id)) return jsonError(400, "id 格式不正確");

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    // 條件包含 createdBy：別人寫的紀錄和不存在的一樣回 404
    const { deletedCount } = await FeedingRecordModel.deleteOne({ _id: id, createdBy: userId });
    if (deletedCount === 0) return jsonError(404, "找不到這筆飲食紀錄");
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
