import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereCondition = session.organizationId
      ? { organizationId: session.organizationId }
      : {};

    const posts = await prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { name: true, orgId: true } },
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !isOrgAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      imageUrl,
      videoUrl,
      mediaType,
      caption,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      xUrl,
    } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Post title is required' }, { status: 400 });
    }

    const effectiveMediaType = mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE';
    const primaryMediaUrl = (effectiveMediaType === 'VIDEO' ? (videoUrl || imageUrl) : imageUrl)?.trim();

    if (!primaryMediaUrl) {
      return NextResponse.json(
        { error: `Post ${effectiveMediaType.toLowerCase()} upload is required` },
        { status: 400 }
      );
    }

    if (caption && caption.length > 5000) {
      return NextResponse.json(
        { error: 'Caption exceeds maximum character limit of 5000 characters' },
        { status: 400 }
      );
    }

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
        organizationId: session.organizationId,
        title: title.trim(),
        imageUrl: primaryMediaUrl,
        mediaType: effectiveMediaType,
        videoUrl: effectiveMediaType === 'VIDEO' ? primaryMediaUrl : null,
        caption: caption?.trim() || null,
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
