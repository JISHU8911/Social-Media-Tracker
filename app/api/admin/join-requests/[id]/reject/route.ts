import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session) || !session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const joinRequestId = params.id;
    const joinReq = await prisma.joinRequest.findUnique({
      where: { id: joinRequestId },
    });

    if (!joinReq || joinReq.organizationId !== session.organizationId) {
      return NextResponse.json(
        { error: 'Join request not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ message: 'Join request rejected' });
  } catch (error) {
    console.error('Reject join request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
