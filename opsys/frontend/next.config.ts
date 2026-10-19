import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_MODE === "static";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  output: isStatic ? "export" : undefined,
  images: isStatic ? { unoptimized: true } : undefined,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;