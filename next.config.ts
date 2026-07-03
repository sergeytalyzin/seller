import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // CDN картинок товаров Ozon
    remotePatterns: [
      { protocol: "https", hostname: "**.ozone.ru" },
      { protocol: "https", hostname: "**.ozonusercontent.com" },
    ],
  },
};

export default nextConfig;
