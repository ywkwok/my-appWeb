import type { NextConfig } from "next";

/**
 * GitHub Pages needs a fully static export.
 * Served from https://<user>.github.io/my-appWeb/  => basePath set.
 * Output goes to /docs so Pages can deploy straight from that folder.
 */
const repoName = "my-appWeb";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "docs", // GitHub Pages "Deploy from a branch" -> /docs
  basePath: `/${repoName}`,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
