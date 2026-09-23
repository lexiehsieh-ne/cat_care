import "server-only";
import { Error as MongooseError, isValidObjectId } from "mongoose";

export function jsonError(status: number, message: string, details?: unknown) {
  return Response.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function isObjectId(id: unknown): id is string {
  return typeof id === "string" && isValidObjectId(id);
}

// 只保留允許修改的欄位，避免前端送來 _id、createdAt 等欄位
export function pick<T extends Record<string, unknown>>(body: T, keys: readonly string[]) {
  return Object.fromEntries(Object.entries(body).filter(([k]) => keys.includes(k)));
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

// 把 Mongoose 驗證錯誤轉成 400，其餘視為 500
export function handleError(err: unknown) {
  if (err instanceof MongooseError.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
    return jsonError(400, "資料驗證失敗", details);
  }
  if (err instanceof MongooseError.CastError) {
    return jsonError(400, `欄位 ${err.path} 格式不正確`);
  }
  console.error(err);
  return jsonError(500, "伺服器錯誤");
}
