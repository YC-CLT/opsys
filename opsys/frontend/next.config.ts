import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_MODE === "static" || process.env.BUILD_STATIC === "1";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  images: isStatic ? { unoptimized: true } : undefined,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: !isStatic,
  partialPrefetching: !isStatic,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  env: {
    NEXT_PUBLIC_MODE: process.env.NEXT_PUBLIC_MODE || 'live',
    NEXT_PUBLIC_HASH_FILE: '/data/question-hashes.json',
  },
};

export default nextConfig;