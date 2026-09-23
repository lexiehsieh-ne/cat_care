import { endSession } from "@/lib/auth";

// POST /api/auth/logout → 刪除登入 Cookie
export async function POST() {
  await endSession();
  return new Response(null, { status: 204 });
}
