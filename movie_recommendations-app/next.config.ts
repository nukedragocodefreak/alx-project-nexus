import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "image.tmdb.org" },
      { protocol: "http", hostname: "images.unsplash.com" },
    ],
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;