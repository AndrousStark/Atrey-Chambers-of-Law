import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || '';
const SESSION_COOKIE_NAME = 'ac_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

interface SessionPayload {
  email: string;
  role: string;
}

/**
 * Hash a password using PBKDF2 (built-in Node.js crypto, no external deps).
 * Returns "salt:hash" string for storage in env variables.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored PBKDF2 hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;

  const [salt, hash] = parts;
  if (!salt || !hash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  if (computedHash.length !== hash.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(computedHash, 'hex')
  );
}

/**
 * Create a signed session token using HMAC-SHA256.
 * Token format: base64url(payload).base64url(signature)
 */
export function createSessionToken(payload: SessionPayload): string {
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const data = JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a session token.
 * Returns null if invalid, expired, or tampered with.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!SESSION_SECRET) return null;

  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return null;

    const encoded = token.substring(0, dotIndex);
    const signature = token.substring(dotIndex + 1);
    if (!encoded || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');

    // Timing-safe comparison
    if (expectedSignature.length !== signature.length) return null;
    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!signaturesMatch) return null;

    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;

    return { email: data.email, role: data.role };
  } catch {
    return null;
  }
}

/** Set an httpOnly session cookie. */
export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/** Clear the session cookie. */
export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/** Get the current session from the request cookies. Returns null if not authenticated. */
export function getSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Get the list of allowed admin emails from environment.
 * Supports both ADMIN_EMAIL (single) and ADMIN_EMAILS (comma-separated).
 */
export function getAdminEmails(): string[] {
  const emails: string[] = [];

  const single = process.env.ADMIN_EMAIL;
  if (single) emails.push(single.toLowerCase().trim());

  const multiple = process.env.ADMIN_EMAILS;
  if (multiple) {
    multiple.split(',').forEach(e => {
      const trimmed = e.toLowerCase().trim();
      if (trimmed && !emails.includes(trimmed)) {
        emails.push(trimmed);
      }
    });
  }

  return emails;
}

/**
 * Check if a given email is an authorized admin email.
 */
export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase().trim());
}

/**
 * Require admin authentication. Returns the session or throws.
 * Use in API route handlers that need admin access.
 */
export function requireAdmin(): SessionPayload {
  const session = getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}
