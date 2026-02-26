import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const RESOURCES_BLOB_KEY = 'resources.json';

async function readResources(): Promise<{ resources: any[]; published: any[] }> {
  try {
    const { blobs } = await list({ 
      prefix: RESOURCES_BLOB_KEY, 
      token: process.env.BLOB_READ_WRITE_TOKEN 
    });
    
    const resourceBlob = blobs.find(blob => blob.pathname === RESOURCES_BLOB_KEY);
    
    if (!resourceBlob) {
      return { resources: [], published: [] };
    }

    // Add cache-busting parameter to ensure fresh data
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

async function writeResources(data: any, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      await put(RESOURCES_BLOB_KEY, blob, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
      });
      
      // Verify the write was successful
      const verifyData = await readResources();
      if (verifyData.resources.length === data.resources.length) {
        return; // Write successful
      } else {
        console.warn(`Write verification failed. Expected ${data.resources.length} resources, got ${verifyData.resources.length}. Retrying...`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    } catch (error) {
      console.error(`Error writing resources (attempt ${attempt + 1}/${retries}):`, error);
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, publish } = await req.json();
    
    // Retry logic to handle race conditions
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
      // Re-read fresh data before each attempt
      const data = await readResources();
      
      // Ensure arrays exist
      if (!data.resources) {
        data.resources = [];
      }
      if (!data.published) {
        data.published = [];
      }
      
      const resource = data.resources.find((r: any) => r.id === id);
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

