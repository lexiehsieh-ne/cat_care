import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createOpenAIClient } from "@/lib/openai";
import { API_KEY_HEADER } from "@/lib/constants";

export async function POST(request: Request) {
  const apiKey = request.headers.get(API_KEY_HEADER)?.trim();

  if (!apiKey) {
    return NextResponse.json({ valid: false, error: "請提供 API Key" }, { status: 400 });
  }

  const openai = createOpenAIClient(apiKey);

  try {
    await openai.models.list();
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[/api/validate-key] validation failed:", error);

    if (error instanceof OpenAI.APIError) {
      const message =
        error.status === 401
          ? "API Key 無效，請確認是否輸入正確"
          : error.message || "驗證時發生錯誤";
      return NextResponse.json(
        { valid: false, error: message },
        { status: error.status ?? 502 }
      );
    }

    return NextResponse.json(
      { valid: false, error: "無法連線至 OpenAI，請稍後再試" },
      { status: 502 }
    );
  }
}
