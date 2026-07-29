import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10 MB' },
        { status: 400 }
      );
    }

    // Check allowed file types: JPG, PNG, WEBP
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Allowed formats: JPG, PNG, WEBP' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || '.jpg';
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${safeBaseName}${ext}`;

    // 1. Cloud Vercel Blob Storage (Production on Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${filename}`, file, {
          access: 'public',
        });

        return NextResponse.json({
          message: 'Upload to Vercel Blob successful',
          url: blob.url,
          filename,
        });
      } catch (blobError: any) {
        console.error('Vercel Blob Upload Error:', blobError);
        if (
          blobError?.message?.includes('private store') ||
          blobError?.message?.includes('public access')
        ) {
          return NextResponse.json(
            {
              error:
                'Vercel Blob Configuration Error: Cannot use public access on a private store. Please recreate your Vercel Blob store as a Public Store in the Vercel Dashboard (Storage -> Create -> Vercel Blob -> Select Public Access).',
            },
            { status: 400 }
          );
        }
        throw blobError;
      }
    }

    // 2. Local Filesystem Fallback (Local Server / VPS)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // Directory exists
    }

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      message: 'Upload to local storage successful',
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
