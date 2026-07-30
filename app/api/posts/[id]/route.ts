import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin, isPlatformSuperAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        organization: { select: { id: true, name: true, orgId: true } },
        submissions: {
          include: {
            designation: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verify Org access if user logged in
    if (
      session &&
      !isPlatformSuperAdmin(session) &&
      post.organizationId &&
      session.organizationId !== post.organizationId
    ) {
      return NextResponse.json(
        { error: 'Access denied: Post belongs to another organization' },
        { status: 403 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!isPlatformSuperAdmin(session) && post.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { title, imageUrl, caption, facebookUrl, instagramUrl, linkedinUrl, xUrl } =
      await request.json();

    if (caption && caption.length > 5000) {
      return NextResponse.json(
        { error: 'Caption exceeds maximum character limit of 5000 characters' },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: title?.trim(),
        imageUrl: imageUrl?.trim(),
        caption: caption !== undefined ? caption.trim() || null : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl.trim() || null : undefined,
        instagramUrl: instagramUrl !== undefined ? instagramUrl.trim() || null : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl.trim() || null : undefined,
        xUrl: xUrl !== undefined ? xUrl.trim() || null : undefined,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!isPlatformSuperAdmin(session) && post.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
