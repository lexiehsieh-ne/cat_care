import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 天

function secretKey() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("請在 .env.local 設定 JWT_SECRET");
  return new TextEncoder().encode(secret);
}

// 登入成功：簽發 JWT（sub = 使用者 id），存進 HTTP-only Cookie
export async function startSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, // 前端 JavaScript 讀不到，降低 XSS 偷走 token 的風險
    secure: process.env.NODE_ENV === "production", // 正式環境只走 HTTPS
    sameSite: "lax", // 其他網站發出的 POST 不會帶上這個 Cookie
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE_NAME);
}

// 讀取 Cookie 裡的 JWT；沒有、過期或被竄改都回傳 null
export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
