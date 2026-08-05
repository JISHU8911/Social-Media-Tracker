import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgIdParam = searchParams.get('orgId');

    if (!orgIdParam || !orgIdParam.trim()) {
      return NextResponse.json({ designations: [] });
    }

    const cleanOrgId = orgIdParam.trim().toUpperCase();

    const organization = await prisma.organization.findFirst({
      where: {
        orgId: cleanOrgId,
        status: 'ACTIVE',
      },
      include: {
        designations: {
          where: { active: true },
          select: { id: true, designationName: true },
          orderBy: { designationName: 'asc' },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found', designations: [] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organizationId: organization.id,
      organizationName: organization.name,
      orgIdCode: organization.orgId,
      designations: organization.designations,
    });
  } catch (error) {
    console.error('Fetch organization designations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
