import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Fetch all active memberships for the current user
  const memberships = await prisma.organizationMembership.findMany({
    where: {
      userId: session.id,
      status: 'ACTIVE',
      organization: {
        status: 'ACTIVE',
      },
    },
    include: {
      organization: {
        select: {
          id: true,
          orgId: true,
          name: true,
          displayName: true,
          logoUrl: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedMemberships = memberships.map((m) => ({
    id: m.id,
    organizationId: m.organizationId,
    organizationName: m.organization.displayName || m.organization.name,
    officialName: m.organization.name,
    orgIdCode: m.organization.orgId,
    logoUrl: m.organization.logoUrl,
    role: m.role,
    status: m.status,
    isActiveCurrent: m.organizationId === session.organizationId,
  }));

  return NextResponse.json({
    user: session,
    memberships: formattedMemberships,
  });
}
