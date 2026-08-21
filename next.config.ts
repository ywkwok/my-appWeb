import type { NextConfig } from "next";

/**
 * GitHub Pages needs a fully static export.
 * Because the site is served from https://<user>.github.io/<repo>/,
 * we declare that repo name as the basePath so asset links work.
 */
const repoName = "my-appWeb";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repoName}`,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
