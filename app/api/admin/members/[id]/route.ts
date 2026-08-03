import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isOrgAdmin(session) || !session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { role } = await request.json(); // ORGANIZATION_ADMIN | MEMBER
    const membershipId = params.id;

    const membership = await prisma.organizationMembership.findUnique({
      where: { id: membershipId },
      include: { user: true },
    });

    if (!membership || membership.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Protection check for ORGANIZATION_SUPER_ADMIN
    if (membership.role === 'ORGANIZATION_SUPER_ADMIN' || membership.user.role === 'ORGANIZATION_SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Organization Super Admin cannot be demoted or modified.' },
        { status: 400 }
      );
    }

    // Protection check for PLATFORM_SUPER_ADMIN
    if (membership.user.role === 'PLATFORM_SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify Platform Super Admin account.' },
        { status: 400 }
      );
    }

    await prisma.organizationMembership.update({
      where: { id: membershipId },
      data: { role },
    });
    await prisma.user.update({
      where: { id: membership.userId },
      data: { role },
    });

    return NextResponse.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Member management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const membershipId = params.id;
    const membership = await prisma.organizationMembership.findUnique({
      where: { id: membershipId },
      include: { user: true },
    });

    if (!membership || membership.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Protection check for ORGANIZATION_SUPER_ADMIN
    if (membership.role === 'ORGANIZATION_SUPER_ADMIN' || membership.user.role === 'ORGANIZATION_SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Organization Super Admin cannot be removed.' },
        { status: 400 }
      );
    }

    await prisma.organizationMembership.delete({
      where: { id: membershipId },
    });

    // Remove user organization association
    await prisma.user.update({
      where: { id: membership.userId },
      data: { organizationId: null, role: 'USER' },
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
