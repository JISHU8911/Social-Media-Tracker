import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orgId, uniqueCode } = await request.json();

    if (!orgId || !uniqueCode) {
      return NextResponse.json(
        { error: 'Organization ID and Unique Code are required' },
        { status: 400 }
      );
    }

    const cleanOrgId = orgId.trim().toUpperCase();
    const cleanCode = uniqueCode.trim().toUpperCase();

    const organization = await prisma.organization.findFirst({
      where: {
        orgId: cleanOrgId,
        uniqueCode: cleanCode,
      },
      include: {
        designations: {
          where: { active: true },
          select: { id: true, designationName: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Invalid Organization ID or Unique Code' },
        { status: 404 }
      );
    }

    if (organization.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Organization is currently ${organization.status.toLowerCase()}` },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      organizationId: organization.id,
      organizationName: organization.name,
      orgIdCode: organization.orgId,
      designations: organization.designations,
    });
  } catch (error) {
    console.error('Verify organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
