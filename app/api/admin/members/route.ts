import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session) || !session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const memberships = await prisma.organizationMembership.findMany({
      where: {
        organizationId: session.organizationId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, active: true } },
        designation: { select: { id: true, designationName: true } },
      },
    });

    const formatted = memberships.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      designation: m.designation?.designationName || 'N/A',
      designationId: m.designationId,
      role: m.role,
      status: m.user.active ? 'ACTIVE' : 'DEACTIVATED',
      joinedAt: m.createdAt,
    }));

    return NextResponse.json({ members: formatted });
  } catch (error) {
    console.error('List members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
