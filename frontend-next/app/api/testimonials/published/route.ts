import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// Disable caching for this route
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

    // Add cache-busting parameter to ensure fresh data
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

export async function GET() {
  try {
    const data = await readTestimonials();
    const publishedTestimonials = data.testimonials.filter((t: any) => t.published);
    
    // Disable caching to ensure fresh data
    return NextResponse.json(publishedTestimonials, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching published testimonials:', error);
    return NextResponse.json({ error: 'Failed to read published testimonials' }, { status: 500 });
  }
}

