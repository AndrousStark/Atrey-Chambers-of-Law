import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// Disable caching for this route
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

export async function GET() {
  try {
    const data = await readResources();
    const publishedResources = data.resources.filter((r: any) => 
      r.published && data.published.includes(r.id)
    );
    
    // Disable caching to ensure fresh data
    return NextResponse.json(publishedResources, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching published resources:', error);
    return NextResponse.json({ error: 'Failed to read published resources' }, { status: 500 });
  }
}

