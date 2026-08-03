import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  console.log('\n==================================================');
  console.log('[MEDIA UPLOAD API ROUTE CALLED]');

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err: any) {
    console.error('Error parsing multipart form data payload:', err);
    return NextResponse.json(
      { error: 'Failed to read upload payload. File size may exceed maximum server limit.' },
      { status: 413 }
    );
  }

  try {
    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('No file payload found in form data');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const fileExt = (path.extname(file.name) || '').toLowerCase();
    const isVideo =
      file.type.startsWith('video/') ||
      ['.mp4', '.mov', '.webm'].some((ext) => file.name.toLowerCase().endsWith(ext));

    console.log(`File Name: ${file.name}`);
    console.log(`File Size: ${fileSizeMb} MB (${file.size} bytes)`);
    console.log(`MIME Type: ${file.type || 'unknown'}`);
    console.log(`Detected Category: ${isVideo ? 'VIDEO' : 'IMAGE'}`);

    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const maxAllowedSize = isVideo ? maxVideoSize : maxImageSize;

    if (file.size > maxAllowedSize) {
      const errMessage = isVideo
        ? `Video size (${fileSizeMb} MB) exceeds maximum limit of 100 MB`
        : `Image size (${fileSizeMb} MB) exceeds maximum limit of 10 MB`;
      console.error(errMessage);
      return NextResponse.json({ error: errMessage }, { status: 400 });
    }

    const allowedImageMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoMime = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];
    const allowedImageExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedVideoExt = ['.mp4', '.mov', '.webm'];

    const isValidImage = allowedImageMime.includes(file.type) || allowedImageExt.includes(fileExt);
    const isValidVideo = allowedVideoMime.includes(file.type) || allowedVideoExt.includes(fileExt);

    if (!isValidImage && !isValidVideo) {
      console.error(`Invalid format for file ${file.name} (MIME: ${file.type}, Ext: ${fileExt})`);
      return NextResponse.json(
        {
          error:
            'Invalid file format. Allowed formats: Images (JPG, PNG, WEBP) or Videos (MP4, MOV, WEBM)',
        },
        { status: 400 }
      );
    }

    const mediaType: 'IMAGE' | 'VIDEO' = isValidVideo ? 'VIDEO' : 'IMAGE';
    const ext = fileExt || (mediaType === 'VIDEO' ? '.mp4' : '.jpg');
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${safeBaseName}${ext}`;

    // 1. Vercel Blob Storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        console.log('Attempting Vercel Blob upload...');
        const blob = await put(`uploads/${filename}`, file, {
          access: 'public',
          contentType: file.type || (mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
        });

        console.log('Vercel Blob Upload Successful:', blob.url);
        console.log('==================================================\n');
        return NextResponse.json({
          message: 'Upload successful',
          url: blob.url,
          filename,
          mediaType,
        });
      } catch (blobError: any) {
        console.error('Vercel Blob Upload Error:', blobError);
      }
    }

    // 2. Local Filesystem Fallback
    console.log('Using Local Filesystem fallback upload...');
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

    console.log('Local Filesystem Upload Successful:', publicUrl);
    console.log('==================================================\n');

    return NextResponse.json({
      message: 'Upload to local storage successful',
      url: publicUrl,
      filename,
      mediaType,
    });
  } catch (error: any) {
    console.error('Unhandled File Upload Error:', error);
    console.log('==================================================\n');
    return NextResponse.json(
      { error: error?.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
