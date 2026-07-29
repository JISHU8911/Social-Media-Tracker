import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Only Super Admins can delete designations.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if designation is referenced by existing employee submissions
    const submissionCount = await prisma.submission.count({
      where: { designationId: id },
    });

    if (submissionCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete designation. It is referenced by ${submissionCount} existing employee submission(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.designation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Error deleting designation:', error);
    return NextResponse.json(
      { error: 'Failed to delete designation' },
      { status: 500 }
    );
  }
}
