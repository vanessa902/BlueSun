import type { NextConfig } from "next";

// When building for GitHub Pages we export a fully static site and serve it
// under /<repo>. The PAGES_BASE_PATH env var is set by the deploy workflow.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    // Static export can't use the Next image optimizer; load images directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
