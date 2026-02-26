import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RESOURCES_BLOB_KEY = 'resources.json';

// Read resources from Blob
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

// Write resources to Blob with retry logic
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
      
      // Verify the write was successful by reading back
      const verifyData = await readResources();
      if (verifyData.resources.length === data.resources.length) {
        return; // Write successful
      } else {
        console.warn(`Write verification failed. Expected ${data.resources.length} resources, got ${verifyData.resources.length}. Retrying...`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // Exponential backoff
        }
      }
  } catch (error) {
      console.error(`Error writing resources (attempt ${attempt + 1}/${retries}):`, error);
      if (attempt === retries - 1) {
    throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // Exponential backoff
    }
  }
}

export async function GET() {
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
    const body = await req.json();
    
    // Generate unique ID using timestamp + random to avoid collisions
    let uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Retry logic to handle race conditions
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    let savedResource: any = null;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
      // Re-read fresh data before each attempt
      const data = await readResources();
      
      // Ensure resources array exists
      if (!data.resources) {
        data.resources = [];
      }
      
      // Ensure published array exists
      if (!data.published) {
        data.published = [];
      }
      
      // Check if resource with this ID already exists (shouldn't happen, but safety check)
      const existingIndex = data.resources.findIndex((r: any) => r.id === uniqueId);
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
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 200 * attempts));
          } else {
            throw writeError;
          }
        }
      } else {
        // ID collision (very unlikely), generate new one
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
    const body = await req.json();
    const { id, ...updates } = body;
    
    // Retry logic to handle race conditions
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
      // Re-read fresh data before each attempt
    const data = await readResources();
    
    const index = data.resources.findIndex((r: any) => r.id === id);
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Resource ID required' }, { status: 400 });
    }
    
    const data = await readResources();
    data.resources = data.resources.filter((r: any) => r.id !== id);
    // Fix: use different variable name to avoid shadowing
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

