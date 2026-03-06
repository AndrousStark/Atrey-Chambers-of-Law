import { NextRequest } from 'next/server';

/**
 * Validate that a mutation request originates from a trusted origin.
 *
 * Checks the Origin header (or Referer as fallback) against a whitelist
 * of allowed origins. This prevents cross-site request forgery where a
 * malicious site submits forms to our API.
 */
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // Build the list of allowed origins from known domains + env config
  const allowedOrigins: string[] = [
    'https://www.atreychambers.com',
    'https://atreychambers.com',
  ];

  // Allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    );
  }

  // Allow a custom site URL if configured
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    allowedOrigins.push(siteUrl.replace(/\/$/, ''));
  }

  // Vercel preview URLs
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    allowedOrigins.push(`https://${vercelUrl}`);
  }

  // Check Origin header first (most reliable)
  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed);
  }

  // Fall back to Referer header
  if (referer) {
    return allowedOrigins.some((allowed) => referer.startsWith(allowed));
  }

  // If neither header is present, this is likely a same-origin request
  // from an older browser. Allow it but only in non-production.
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // In production, reject requests with no origin info
  return false;
}
