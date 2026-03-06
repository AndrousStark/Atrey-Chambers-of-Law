/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.REPO_NAME || '';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  // Static export for GitHub Pages; server mode for Vercel/local dev
  ...(isGitHubPages && { output: 'export' }),
  basePath: isGitHubPages && repoName ? `/${repoName}` : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  assetPrefix: isGitHubPages && repoName ? `/${repoName}` : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  // Disable trailing slash issues with GitHub Pages
  ...(isGitHubPages && { trailingSlash: true }),
  // Security and SEO headers (server mode only)
  ...(!isGitHubPages && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
        // Cache static assets aggressively
        {
          source: '/(.*)\\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
      ];
    },
    // www → non-www redirect (or vice versa, handled by Vercel)
    async redirects() {
      return [
        // Old WordPress paths → new Next.js paths
        { source: '/wp-admin', destination: '/signin', permanent: true },
        { source: '/wp-admin/:path*', destination: '/signin', permanent: true },
        { source: '/wp-login.php', destination: '/signin', permanent: true },
        { source: '/about', destination: '/our-firm', permanent: true },
        { source: '/about-us', destination: '/our-firm', permanent: true },
        { source: '/services', destination: '/practice-area', permanent: true },
        { source: '/team', destination: '/our-team', permanent: true },
        { source: '/blog', destination: '/our-blog', permanent: true },
      ];
    },
  }),
};

export default nextConfig;
