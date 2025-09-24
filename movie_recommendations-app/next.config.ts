import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};
module.exports = { compiler: { styledComponents: true } };
export default nextConfig;
