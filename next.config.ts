import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API Key 設定已併入計算頁的步驟 1，舊網址轉過去
  async redirects() {
    return [{ source: "/settings", destination: "/calculator/start", permanent: false }];
  },
  // API 回應的都是登入者自己的資料：不讓瀏覽器或中間的代理伺服器快取
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
