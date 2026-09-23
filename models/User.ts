import { Schema, deleteModel, model, models, type InferSchemaType } from "mongoose";

// 使用者：一位使用者可以有多隻貓（Cat.owner 指向這裡）
const userSchema = new Schema(
  {
    // sparse：早期沒有 email 的測試使用者不會互相衝突
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email 格式不正確"],
    },
    // 只存 bcrypt 雜湊；select: false 讓一般查詢預設不回傳
    passwordHash: { type: String, required: true, select: false },
    // 顯示用名稱
    name: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

// 開發模式 HMR 重新載入時先移除舊 model，讓修改後的 schema 生效，也避免 OverwriteModelError
if (models.User) deleteModel("User");
export const UserModel = model<User>("User", userSchema);
