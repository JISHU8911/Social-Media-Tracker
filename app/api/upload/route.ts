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

    const isVideo = file.type.startsWith('video/') || 
      ['.mp4', '.mov', '.webm'].some((ext) => file.name.toLowerCase().endsWith(ext));

    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 50 * 1024 * 1024; // 50MB
    const maxAllowedSize = isVideo ? maxVideoSize : maxImageSize;

    if (file.size > maxAllowedSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Video size exceeds maximum limit of 50 MB'
            : 'Image size exceeds maximum limit of 10 MB',
        },
        { status: 400 }
      );
    }

    const allowedImageMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoMime = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];

    const fileExt = (path.extname(file.name) || '').toLowerCase();
    const allowedImageExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedVideoExt = ['.mp4', '.mov', '.webm'];

    const isValidImage = allowedImageMime.includes(file.type) || allowedImageExt.includes(fileExt);
    const isValidVideo = allowedVideoMime.includes(file.type) || allowedVideoExt.includes(fileExt);

    if (!isValidImage && !isValidVideo) {
      return NextResponse.json(
        {
          error:
            'Invalid file format. Allowed formats: Images (JPG, PNG, WEBP) or Videos (MP4, MOV, WEBM)',
        },
        { status: 400 }
      );
    }

    const mediaType = isValidVideo ? 'VIDEO' : 'IMAGE';
    const ext = fileExt || (mediaType === 'VIDEO' ? '.mp4' : '.jpg');
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${safeBaseName}${ext}`;

    // 1. Vercel Blob Storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${filename}`, file, {
          access: 'public',
        });

        return NextResponse.json({
          message: 'Upload successful',
          url: blob.url,
          filename,
          mediaType,
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
                'Vercel Blob Configuration Error: Cannot use public access on a private store.',
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. Local Filesystem Fallback
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
      mediaType,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
