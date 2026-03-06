import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';

const RESOURCES_BLOB_KEY = 'resources.json';

async function readResources(): Promise<{ resources: Record<string, unknown>[]; published: string[] }> {
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

export async function POST(req: NextRequest) {
  // Admin auth required
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // CSRF protection
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`resources-publish:${ip}`, RATE_LIMITS.adminMutation);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { id, publish } = await req.json();

    let success = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!success && attempts < maxAttempts) {
      attempts++;
      const data = await readResources();

      if (!data.resources) data.resources = [];
      if (!data.published) data.published = [];

      const resource = data.resources.find((r: Record<string, unknown>) => r.id === id);
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      resource.published = publish;
      resource.publishedAt = publish ? new Date().toISOString() : null;

      if (publish) {
        if (!data.published.includes(id)) {
          data.published.push(id);
        }
      } else {
        data.published = data.published.filter((pid: string) => pid !== id);
      }

      try {
        await writeResources(data);
        success = true;
        return NextResponse.json({ success: true, resource });
      } catch (writeError) {
        console.error(`Publish update attempt ${attempts} failed:`, writeError);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200 * attempts));
        } else {
          throw writeError;
        }
      }
    }

    return NextResponse.json({ error: 'Failed to update publish status after multiple attempts' }, { status: 500 });
  } catch (error) {
    console.error('Error updating publish status:', error);
    return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
  }
}
