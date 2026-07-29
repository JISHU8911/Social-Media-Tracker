import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// GET all designations (Active only by default unless includeInactive parameter set)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { active: true };

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

// POST new designation (Admin / Super Admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { designationName } = await request.json();
    if (!designationName || !designationName.trim()) {
      return NextResponse.json({ error: 'Designation name is required' }, { status: 400 });
    }

    const formattedName = designationName.trim().toUpperCase();

    // Check existing
    const existing = await prisma.designation.findUnique({
      where: { designationName: formattedName },
    });

    if (existing) {
      if (!existing.active) {
        // Reactivate
        const reactivated = await prisma.designation.update({
          where: { id: existing.id },
          data: { active: true },
        });
        return NextResponse.json(reactivated);
      }
      return NextResponse.json({ error: 'Designation already exists' }, { status: 400 });
    }

    const created = await prisma.designation.create({
      data: {
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

// PUT edit or deactivate designation
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, designationName, active } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Designation ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (designationName !== undefined) {
      updateData.designationName = designationName.trim().toUpperCase();
    }
    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const updated = await prisma.designation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating designation:', error);
    return NextResponse.json({ error: 'Failed to update designation' }, { status: 500 });
  }
}
