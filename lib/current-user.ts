import "server-only";
import type { Types } from "mongoose";
import { getSessionUserId } from "@/lib/auth";
import { isObjectId, jsonError } from "@/lib/http";
import { UserModel } from "@/models/User";

// 從 HTTP-only Cookie 的 JWT 取得目前登入的使用者；未登入回傳 401
export async function requireUser(): Promise<{ userId: Types.ObjectId; error?: never } | { userId?: never; error: Response }> {
  const id = await getSessionUserId();
  if (!isObjectId(id)) return { error: jsonError(401, "請先登入") };

  const user = await UserModel.findById(id).select("_id").lean();
  if (!user) return { error: jsonError(401, "帳號不存在，請重新登入") };
  return { userId: user._id };
}
