import { getSessionUserId } from "@/lib/auth";
import { handleError, isObjectId, jsonError } from "@/lib/http";
import { connectMongoose } from "@/lib/mongoose";
import { UserModel } from "@/models/User";

// GET /api/auth/me → 目前登入的使用者；重新整理頁面時前端用它恢復登入狀態
export async function GET() {
  try {
    const id = await getSessionUserId();
    if (!isObjectId(id)) return jsonError(401, "尚未登入");

    await connectMongoose();
    const user = await UserModel.findById(id).select("email name").lean();
    if (!user) return jsonError(401, "尚未登入");
    return Response.json(user);
  } catch (err) {
    return handleError(err);
  }
}
