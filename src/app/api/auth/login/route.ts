import bcrypt from "bcryptjs";
import { startSession } from "@/lib/auth";
import { handleError, jsonError, readJson } from "@/lib/http";
import { connectMongoose } from "@/lib/mongoose";
import { UserModel } from "@/models/User";

// 帳號不存在時也跑一次 bcrypt 比對，讓回應時間一致，避免被用來猜哪些 Email 有註冊
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

// POST /api/auth/login { email, password } → 比對密碼 → 簽發 JWT 存入 HTTP-only Cookie
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body) return jsonError(400, "請傳入 JSON 物件");

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return jsonError(400, "請輸入 Email 和密碼");

    await connectMongoose();
    const user = await UserModel.findOne({ email }).select("+passwordHash");
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    // 不透露是 Email 還是密碼錯
    if (!user || !ok) return jsonError(401, "Email 或密碼錯誤");

    await startSession(String(user._id));
    return Response.json({ _id: user._id, email: user.email, name: user.name });
  } catch (err) {
    return handleError(err);
  }
}
