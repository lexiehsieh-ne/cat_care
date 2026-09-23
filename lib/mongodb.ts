import "server-only";
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("請在 .env.local 設定 MONGODB_URI");
}

// 開發模式下 HMR 會重新載入模組，把 Promise 存在 globalThis 上，避免每次存檔都建立新連線
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;

// 取得資料庫；未指定名稱時使用 URI 中的預設資料庫
export async function getDb(dbName?: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
