import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST create post
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, imageUrl, facebookUrl, instagramUrl, linkedinUrl, xUrl } =
      await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Post title is required' }, { status: 400 });
    }

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ error: 'Post image is required' }, { status: 400 });
    }

    // Generate unique tracking code
    let trackingCode = generateTrackingCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.post.findUnique({ where: { trackingCode } });
      if (!existing) {
        isUnique = true;
      } else {
        trackingCode = generateTrackingCode();
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        facebookUrl: facebookUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        xUrl: xUrl?.trim() || null,
        trackingCode,
        createdBy: session.name,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
