import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isPlatformSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: { id: true, role: true },
        },
        memberships: {
          select: { id: true, role: true },
        },
      },
    });

    const formatted = organizations.map((org) => {
      const adminCount = org.memberships.filter(
        (m) => m.role === 'ORGANIZATION_SUPER_ADMIN' || m.role === 'ORGANIZATION_ADMIN'
      ).length;
      const memberCount = org.memberships.length;

      return {
        id: org.id,
        orgId: org.orgId,
        uniqueCode: org.uniqueCode,
        name: org.name,
        officialEmail: org.officialEmail,
        status: org.status,
        memberCount,
        adminCount,
        createdAt: org.createdAt,
      };
    });

    return NextResponse.json({ organizations: formatted });
  } catch (error) {
    console.error('Super admin list orgs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
