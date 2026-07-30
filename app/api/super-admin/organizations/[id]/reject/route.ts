import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isPlatformSuperAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orgId = params.id;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({
      message: 'Organization request rejected',
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        status: updatedOrg.status,
      },
    });
  } catch (error) {
    console.error('Reject org error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
