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

    // 1. Update JoinRequest status to APPROVED
    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: { status: 'APPROVED' },
    });

    // 2. Create/Update OrganizationMembership
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: joinReq.organizationId,
          userId: joinReq.userId,
        },
      },
      update: {
        designationId: joinReq.designationId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
      create: {
        organizationId: joinReq.organizationId,
        userId: joinReq.userId,
        designationId: joinReq.designationId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    // 3. Update User model role and organizationId
    await prisma.user.update({
      where: { id: joinReq.userId },
      data: {
        role: 'MEMBER',
        organizationId: joinReq.organizationId,
      },
    });

    return NextResponse.json({ message: 'User approved as Organization Member' });
  } catch (error) {
    console.error('Approve join request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
