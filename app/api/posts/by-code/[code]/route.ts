import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { trackingCode: params.code },
    });

    if (!post) {
      return NextResponse.json({ error: 'Invalid tracking link or post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post by code:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
