import { connectMongoose } from "@/lib/mongoose";
import { requireUser } from "@/lib/current-user";
import { handleError, jsonError, pick, readJson } from "@/lib/http";
import { CAT_FIELDS, CatModel } from "@/models/Cat";

// avatarUrl 不在這裡：只能透過 /api/cats/:id/avatar 上傳後由伺服器寫入
const WRITABLE_FIELDS = ["name", "breed", "gender", "age"] as const;

// GET /api/cats（目前登入使用者的貓）
export async function GET() {
  try {
    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    const cats = await CatModel.find({ owner: userId }).sort({ createdAt: 1 }).select(CAT_FIELDS).lean();
    return Response.json(cats);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/cats（登錄新貓咪，主人是目前的使用者）
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body) return jsonError(400, "請傳入 JSON 物件");

    await connectMongoose();
    const { userId, error } = await requireUser();
    if (error) return error;

    const created = await CatModel.create({ ...pick(body, WRITABLE_FIELDS), owner: userId });
    const cat = await CatModel.findById(created._id).select(CAT_FIELDS).lean();
    return Response.json(cat, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
