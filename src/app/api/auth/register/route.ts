import bcrypt from "bcryptjs";
import { startSession } from "@/lib/auth";
import { handleError, jsonError, readJson } from "@/lib/http";
import { connectMongoose } from "@/lib/mongoose";
import { UserModel } from "@/models/User";

const BCRYPT_ROUNDS = 10;

// POST /api/auth/register { email, password, name? } → 建立帳號並直接登入
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body) return jsonError(400, "請傳入 JSON 物件");

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : email.split("@")[0];

    if (!email) return jsonError(400, "請輸入 Email");
    if (password.length < 8) return jsonError(400, "密碼至少需要 8 個字元");
    // bcrypt 只會使用前 72 bytes，超過的部分會被忽略
    if (new TextEncoder().encode(password).length > 72) return jsonError(400, "密碼太長（最多 72 bytes）");

    await connectMongoose();
    if (await UserModel.exists({ email })) return jsonError(409, "這個 Email 已經註冊過了");

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserModel.create({ email, passwordHash, name });

    await startSession(String(user._id));
    return Response.json({ _id: user._id, email: user.email, name: user.name }, { status: 201 });
  } catch (err) {
    // 兩個請求同時註冊同一個 Email 時，由 unique 索引擋下
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return jsonError(409, "這個 Email 已經註冊過了");
    }
    return handleError(err);
  }
}
