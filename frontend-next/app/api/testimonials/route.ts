import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TESTIMONIALS_BLOB_KEY = 'testimonials.json';

// Read testimonials from Blob
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

// Write testimonials to Blob with retry logic
async function writeTestimonials(data: any, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      await put(TESTIMONIALS_BLOB_KEY, blob, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
      });
      
      // Verify the write was successful by reading back
      const verifyData = await readTestimonials();
      if (verifyData.testimonials.length === data.testimonials.length) {
        return; // Write successful
      } else {
        console.warn(`Write verification failed. Expected ${data.testimonials.length} testimonials, got ${verifyData.testimonials.length}. Retrying...`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // Exponential backoff
        }
      }
    } catch (error) {
      console.error(`Error writing testimonials (attempt ${attempt + 1}/${retries}):`, error);
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // Exponential backoff
    }
  }
}

export async function GET() {
  try {
    const data = await readTestimonials();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read testimonials' }, { status: 500 });
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
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
      // Re-read fresh data before each attempt
      const data = await readTestimonials();
      
      // Ensure testimonials array exists
      if (!data.testimonials) {
        data.testimonials = [];
      }
      
      // Check if testimonial with this ID already exists (shouldn't happen, but safety check)
      const existingIndex = data.testimonials.findIndex((t: any) => t.id === uniqueId);
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
    const body = await req.json();
    const { id, ...updates } = body;
    
    // Retry logic to handle race conditions
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
      // Re-read fresh data before each attempt
      const data = await readTestimonials();
      
      const index = data.testimonials.findIndex((t: any) => t.id === id);
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });
    }
    
    const data = await readTestimonials();
    data.testimonials = data.testimonials.filter((t: any) => t.id !== id);
    await writeTestimonials(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}

