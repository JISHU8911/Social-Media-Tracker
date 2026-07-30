import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isPlatformSuperAdmin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await request.json(); // ACTIVE | SUSPENDED | REJECTED
    const orgId = params.id;

    if (!['ACTIVE', 'SUSPENDED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: { status },
    });

    return NextResponse.json({
      message: `Organization status updated to ${status}`,
      organization: updated,
    });
  } catch (error) {
    console.error('Update org status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orgId = params.id;

    await prisma.organization.delete({
      where: { id: orgId },
    });

    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Delete org error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
