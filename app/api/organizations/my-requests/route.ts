import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const pendingRequests = await prisma.joinRequest.findMany({
      where: {
        userId: session.id,
        status: 'PENDING',
      },
      include: {
        organization: {
          select: { id: true, name: true, orgId: true },
        },
        designation: {
          select: { designationName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedRequests = pendingRequests.map((req) => ({
      id: req.id,
      organizationId: req.organizationId,
      organizationName: req.organization.name,
      orgIdCode: req.organization.orgId,
      designationName: req.designation.designationName,
      status: req.status,
      createdAt: req.createdAt,
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('Fetch my join requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
