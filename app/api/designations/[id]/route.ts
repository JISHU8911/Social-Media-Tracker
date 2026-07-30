import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session) || !session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const designationId = params.id;
    const { designationName, active } = await request.json();

    const existing = await prisma.designation.findUnique({
      where: { id: designationId },
    });

    if (!existing || existing.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (designationName !== undefined) {
      updateData.designationName = designationName.trim().toUpperCase();
    }
    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const updated = await prisma.designation.update({
      where: { id: designationId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating designation:', error);
    return NextResponse.json({ error: 'Failed to update designation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session) || !session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const designationId = params.id;

    const designation = await prisma.designation.findUnique({
      where: { id: designationId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!designation || designation.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 });
    }

    // Section 11 Rule: Cannot delete designation if referenced by existing submissions.
    if (designation._count.submissions > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete designation: It is referenced by existing submissions. You may deactivate it instead.',
        },
        { status: 400 }
      );
    }

    await prisma.designation.delete({
      where: { id: designationId },
    });

    return NextResponse.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Error deleting designation:', error);
    return NextResponse.json({ error: 'Failed to delete designation' }, { status: 500 });
  }
}
