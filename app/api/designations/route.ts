import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetOrgId = searchParams.get('organizationId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const session = await getServerSession();
    const effectiveOrgId = session?.organizationId || targetOrgId;

    if (!effectiveOrgId) {
      return NextResponse.json([]);
    }

    const where: any = {
      organizationId: effectiveOrgId,
    };
    if (!includeInactive) {
      where.active = true;
    }

    const designations = await prisma.designation.findMany({
      where,
      orderBy: { designationName: 'asc' },
    });

    return NextResponse.json(designations);
  } catch (error) {
    console.error('Error fetching designations:', error);
    return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session) || !session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { designationName } = await request.json();
    if (!designationName || !designationName.trim()) {
      return NextResponse.json({ error: 'Designation name is required' }, { status: 400 });
    }

    const formattedName = designationName.trim().toUpperCase();

    // Check existing within organization
    const existing = await prisma.designation.findFirst({
      where: {
        organizationId: session.organizationId,
        designationName: formattedName,
      },
    });

    if (existing) {
      if (!existing.active) {
        const reactivated = await prisma.designation.update({
          where: { id: existing.id },
          data: { active: true },
        });
        return NextResponse.json(reactivated);
      }
      return NextResponse.json(
        { error: 'Designation already exists in your organization' },
        { status: 400 }
      );
    }

    const created = await prisma.designation.create({
      data: {
        organizationId: session.organizationId,
        designationName: formattedName,
        active: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating designation:', error);
    return NextResponse.json({ error: 'Failed to create designation' }, { status: 500 });
  }
}
