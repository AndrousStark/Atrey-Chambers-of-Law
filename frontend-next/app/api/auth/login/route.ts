import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setSessionCookie, isAdminEmail, getAdminEmails } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // CSRF check
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit: 5 attempts per 15 minutes per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = checkRateLimit(`login:${ip}`, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  });

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check admin credentials are configured
    const adminEmails = getAdminEmails();
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (adminEmails.length === 0 || !adminPasswordHash) {
      console.error('Admin credentials not configured. Set ADMIN_EMAILS and ADMIN_PASSWORD_HASH env vars.');
      return NextResponse.json({ error: 'Authentication service not configured' }, { status: 500 });
    }

    // Check if email is an authorized admin
    const emailMatch = isAdminEmail(email);
    const passwordMatch = verifyPassword(password, adminPasswordHash);

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session with the actual email used to log in
    const token = createSessionToken({ email: email.toLowerCase().trim(), role: 'admin' });
    setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
