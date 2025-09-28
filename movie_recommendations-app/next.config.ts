import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "image.tmdb.org", pathname: "/t/p/**" },
      { protocol: "http", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
