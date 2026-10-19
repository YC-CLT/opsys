import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_MODE === "static";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
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