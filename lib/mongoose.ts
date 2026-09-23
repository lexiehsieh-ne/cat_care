import "server-only";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("請在 .env.local 設定 MONGODB_URI");
}

// 開發模式下 HMR 會重新載入模組，把連線存在 globalThis 上，避免每次存檔都建立新連線
const globalForMongoose = globalThis as typeof globalThis & {
  _mongoosePromise?: Promise<typeof mongoose>;
};

export async function connectMongoose(): Promise<typeof mongoose> {
  if (!globalForMongoose._mongoosePromise) {
    globalForMongoose._mongoosePromise = mongoose.connect(uri!).catch((err) => {
      // 連線失敗時清掉快取，下次呼叫可以重試
      globalForMongoose._mongoosePromise = undefined;
      throw err;
    });
  }
  return globalForMongoose._mongoosePromise;
}
