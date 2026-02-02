import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // We rely on Convex CLI typechecking for convex/.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
