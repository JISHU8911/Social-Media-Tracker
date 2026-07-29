import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      fullName,
      designationId,
      facebookActions,
      instagramActions,
      linkedinActions,
      xActions,
    } = await request.json();

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim().toUpperCase();
    if (designationId) updateData.designationId = designationId;
    if (facebookActions !== undefined)
      updateData.facebookActions = JSON.stringify(facebookActions);
    if (instagramActions !== undefined)
      updateData.instagramActions = JSON.stringify(instagramActions);
    if (linkedinActions !== undefined)
      updateData.linkedinActions = JSON.stringify(linkedinActions);
    if (xActions !== undefined)
      updateData.xActions = JSON.stringify(xActions);

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: updateData,
      include: { designation: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.submission.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
