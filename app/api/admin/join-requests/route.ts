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

    const [joinRequests, organization] = await Promise.all([
      prisma.joinRequest.findMany({
        where: {
          organizationId: session.organizationId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          designation: { select: { id: true, designationName: true } },
        },
      }),
      prisma.organization.findUnique({
        where: { id: session.organizationId },
        select: { id: true, name: true, orgId: true, uniqueCode: true, officialEmail: true },
      }),
    ]);

    return NextResponse.json({ requests: joinRequests, joinRequests, organization });
  } catch (error) {
    console.error('List join requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
