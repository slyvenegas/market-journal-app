import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
    ignoreDuringBuilds: true,
  }, typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
};

export default nextConfig;
