import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isPlatformSuperAdmin } from '@/lib/auth';

function validateFullName(name: string): boolean {
  const trimmed = name.trim();
  const nameRegex = /^[A-Z]+(\s+[A-Z]+)+$/;
  return nameRegex.test(trimmed);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const {
      postId,
      fullName,
      designationId,
      facebookActions,
      instagramActions,
      linkedinActions,
      xActions,
      forceUpdate,
    } = await request.json();

    if (!postId || !fullName || !designationId) {
      return NextResponse.json(
        { error: 'Post ID, Full Name, and Designation are required.' },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formattedName = fullName.trim().toUpperCase();

    if (!validateFullName(formattedName)) {
      return NextResponse.json(
        {
          error:
            'Please enter your full name in CAPITAL LETTERS. Must contain at least two words without numbers or special characters.',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.submission.findUnique({
      where: {
        unique_employee_post_submission: {
          postId,
          fullName: formattedName,
          designationId,
        },
      },
    });

    if (existing && !forceUpdate) {
      return NextResponse.json(
        {
          duplicate: true,
          message: 'You have already submitted an interaction for this post.',
          submission: existing,
        },
        { status: 409 }
      );
    }

    const fbJson = JSON.stringify(facebookActions || []);
    const igJson = JSON.stringify(instagramActions || []);
    const liJson = JSON.stringify(linkedinActions || []);
    const xJson = JSON.stringify(xActions || []);

    const orgId = post.organizationId || session?.organizationId || null;
    const userId = session?.id || null;

    if (existing && forceUpdate) {
      const updated = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          facebookActions: fbJson,
          instagramActions: igJson,
          linkedinActions: liJson,
          xActions: xJson,
          userId: userId || existing.userId,
          organizationId: orgId || existing.organizationId,
        },
        include: { designation: true, post: true },
      });
      return NextResponse.json({ message: 'Submission updated successfully', submission: updated });
    }

    const created = await prisma.submission.create({
      data: {
        organizationId: orgId,
        userId: userId,
        postId,
        fullName: formattedName,
        designationId,
        facebookActions: fbJson,
        instagramActions: igJson,
        linkedinActions: liJson,
        xActions: xJson,
      },
      include: { designation: true, post: true },
    });

    return NextResponse.json(
      { message: 'Submission recorded successfully', submission: created },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to record submission' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const designationId = searchParams.get('designationId');
    const nameQuery = searchParams.get('name');
    const myHistory = searchParams.get('myHistory') === 'true';

    const where: any = {};

    if (myHistory) {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      where.userId = session.id;
    } else {
      if (session && !isPlatformSuperAdmin(session)) {
        if (session.organizationId) {
          where.organizationId = session.organizationId;
        }
      }
    }

    if (postId) where.postId = postId;
    if (designationId) where.designationId = designationId;
    if (nameQuery) {
      where.fullName = { contains: nameQuery.trim().toUpperCase() };
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        post: {
          select: {
            title: true,
            trackingCode: true,
            imageUrl: true,
            facebookUrl: true,
            instagramUrl: true,
            linkedinUrl: true,
            xUrl: true,
          },
        },
        designation: true,
        organization: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
