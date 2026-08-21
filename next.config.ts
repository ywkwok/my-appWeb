import type { NextConfig } from "next";

/**
 * GitHub Pages setup (via GitHub Actions):
 * - `output: "export"` produces a fully static site in `./out`
 *   (the default export directory; Actions uploads ./out as the Pages artifact).
 * - `basePath` matches the repo name so asset links work under
 *   https://ywkwok.github.io/my-appWeb/
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
