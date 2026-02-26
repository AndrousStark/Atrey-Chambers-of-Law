/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.REPO_NAME || '';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Static export for GitHub Pages; server mode for Vercel/local dev
  ...(isGitHubPages && { output: 'export' }),
  basePath: isGitHubPages && repoName ? `/${repoName}` : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  assetPrefix: isGitHubPages && repoName ? `/${repoName}` : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  // Disable trailing slash issues with GitHub Pages
  ...(isGitHubPages && { trailingSlash: true }),
};

export default nextConfig;
