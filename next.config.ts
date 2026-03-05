import type { NextConfig } from "next";

const workspaceRoot = process.cwd();

const distDir = process.env.NEXT_DIST_DIR || ".next";

const nextConfig: NextConfig = {
  distDir,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  experimental: {
    // Avoid file-lock errors in restricted environments when starting dev server.
    lockDistDir: false,
  },
};

export default nextConfig;
