import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    const isValidImage = validImageTypes.includes(file.type);
    const isValidVideo = validVideoTypes.includes(file.type);
    
    if (!isValidImage && !isValidVideo) {
      return NextResponse.json({ error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 });
    }

    // Validate file size
    const maxImageSize = 5 * 1024 * 1024; // 5MB for images
    const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
    const maxSize = isValidImage ? maxImageSize : maxVideoSize;
    
    if (file.size > maxSize) {
      const sizeLimit = isValidImage ? '5MB' : '100MB';
      return NextResponse.json({ error: `File size exceeds ${sizeLimit} limit` }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `uploads/${timestamp}_${originalName}`;

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Return the public URL
    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Upload error:', error);
    const errorMessage = error?.message || 'Failed to upload file';
    return NextResponse.json({ error: errorMessage }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

