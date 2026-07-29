import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, imageUrl, facebookUrl, instagramUrl, linkedinUrl, xUrl } =
      await request.json();

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: title?.trim(),
        imageUrl: imageUrl?.trim(),
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
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Only Super Admins can delete posts.' },
        { status: 403 }
      );
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
