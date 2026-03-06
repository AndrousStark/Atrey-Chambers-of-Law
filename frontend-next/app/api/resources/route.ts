import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RESOURCES_BLOB_KEY = 'resources.json';

async function readResources() {
  try {
    const { blobs } = await list({
      prefix: RESOURCES_BLOB_KEY,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const resourceBlob = blobs.find(blob => blob.pathname === RESOURCES_BLOB_KEY);

    if (!resourceBlob) {
      return { resources: [], published: [] };
    }

    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(resourceBlob.url + cacheBuster, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return { resources: [], published: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading resources:', error);
    return { resources: [], published: [] };
  }
}

async function writeResources(data: { resources: Record<string, unknown>[]; published: string[] }, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      await put(RESOURCES_BLOB_KEY, blob, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
      });

      const verifyData = await readResources();
      if (verifyData.resources.length === data.resources.length) {
        return;
      } else {
        console.warn(`Write verification failed. Expected ${data.resources.length}, got ${verifyData.resources.length}. Retrying...`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    } catch (error) {
      console.error(`Error writing resources (attempt ${attempt + 1}/${retries}):`, error);
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}

export async function GET(req: NextRequest) {
  // Admin auth required to list ALL resources (including unpublished)
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await readResources();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read resources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`resources-create:${ip}`, RATE_LIMITS.adminMutation);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    let uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    let savedResource: Record<string, unknown> | null = null;

    while (!success && attempts < maxAttempts) {
      attempts++;
      const data = await readResources();
      if (!data.resources) data.resources = [];
      if (!data.published) data.published = [];

      const existingIndex = data.resources.findIndex((r: Record<string, unknown>) => r.id === uniqueId);
      if (existingIndex === -1) {
        const newResource = {
          id: uniqueId,
          ...body,
          createdAt: new Date().toISOString(),
          published: false
        };

        data.resources.push(newResource);
        savedResource = newResource;

        try {
          await writeResources(data);
          success = true;
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

    if (!success || !savedResource) {
      throw new Error('Failed to save resource after multiple attempts');
    }

    return NextResponse.json({ success: true, resource: savedResource }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
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
  const rateCheck = checkRateLimit(`resources-update:${ip}`, RATE_LIMITS.adminMutation);
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
      const data = await readResources();

      const index = data.resources.findIndex((r: Record<string, unknown>) => r.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      data.resources[index] = { ...data.resources[index], ...updates };

      try {
        await writeResources(data);
        success = true;
        return NextResponse.json({ success: true, resource: data.resources[index] }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      } catch (writeError) {
        console.error(`Update attempt ${attempts} failed:`, writeError);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200 * attempts));
        } else {
          throw writeError;
        }
      }
    }

    return NextResponse.json({ error: 'Failed to update resource after multiple attempts' }, { status: 500 });
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
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
      return NextResponse.json({ error: 'Resource ID required' }, { status: 400 });
    }

    const data = await readResources();
    data.resources = data.resources.filter((r: Record<string, unknown>) => r.id !== id);
    if (data.published) {
      data.published = data.published.filter((publishedId: string) => publishedId !== id);
    }
    await writeResources(data);

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
