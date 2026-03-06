import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TESTIMONIALS_BLOB_KEY = 'testimonials.json';

async function readTestimonials() {
  try {
    const { blobs } = await list({
      prefix: TESTIMONIALS_BLOB_KEY,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const testimonialBlob = blobs.find(blob => blob.pathname === TESTIMONIALS_BLOB_KEY);

    if (!testimonialBlob) {
      return { testimonials: [] };
    }

    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(testimonialBlob.url + cacheBuster, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return { testimonials: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading testimonials:', error);
    return { testimonials: [] };
  }
}

async function writeTestimonials(data: { testimonials: Record<string, unknown>[] }, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      await put(TESTIMONIALS_BLOB_KEY, blob, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
      });

      const verifyData = await readTestimonials();
      if (verifyData.testimonials.length === data.testimonials.length) {
        return;
      } else {
        console.warn(`Write verification failed. Expected ${data.testimonials.length}, got ${verifyData.testimonials.length}. Retrying...`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    } catch (error) {
      console.error(`Error writing testimonials (attempt ${attempt + 1}/${retries}):`, error);
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}

export async function GET(req: NextRequest) {
  // Admin auth required to list ALL testimonials (including unpublished)
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await readTestimonials();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Admin auth + CSRF
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit admin mutations
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`testimonials-create:${ip}`, RATE_LIMITS.adminMutation);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    let uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!success && attempts < maxAttempts) {
      attempts++;
      const data = await readTestimonials();
      if (!data.testimonials) data.testimonials = [];

      const existingIndex = data.testimonials.findIndex((t: Record<string, unknown>) => t.id === uniqueId);
      if (existingIndex === -1) {
        const newTestimonial = {
          id: uniqueId,
          ...body,
          createdAt: new Date().toISOString(),
          published: body.published || false
        };

        data.testimonials.push(newTestimonial);

        try {
          await writeTestimonials(data);
          success = true;
          return NextResponse.json({ success: true, testimonial: newTestimonial });
        } catch (writeError) {
          console.error(`Write attempt ${attempts} failed:`, writeError);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200 * attempts));
          } else {
            throw writeError;
          }
        }
      } else {
        uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
    }

    if (!success) {
      throw new Error('Failed to save testimonial after multiple attempts');
    }

    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`testimonials-update:${ip}`, RATE_LIMITS.adminMutation);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    let success = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!success && attempts < maxAttempts) {
      attempts++;
      const data = await readTestimonials();

      const index = data.testimonials.findIndex((t: Record<string, unknown>) => t.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
      }

      data.testimonials[index] = { ...data.testimonials[index], ...updates };

      try {
        await writeTestimonials(data);
        success = true;
        return NextResponse.json({ success: true, testimonial: data.testimonials[index] });
      } catch (writeError) {
        console.error(`Update attempt ${attempts} failed:`, writeError);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200 * attempts));
        } else {
          throw writeError;
        }
      }
    }

    return NextResponse.json({ error: 'Failed to update testimonial after multiple attempts' }, { status: 500 });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });
    }

    const data = await readTestimonials();
    data.testimonials = data.testimonials.filter((t: Record<string, unknown>) => t.id !== id);
    await writeTestimonials(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
