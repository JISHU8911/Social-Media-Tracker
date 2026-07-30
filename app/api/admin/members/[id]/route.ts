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

    const { action } = await request.json(); // PROMOTE | DEMOTE | TOGGLE_ACTIVE
    const membershipId = params.id;

    const membership = await prisma.organizationMembership.findUnique({
      where: { id: membershipId },
      include: { user: true },
    });

    if (!membership || membership.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Safety checks for PLATFORM_SUPER_ADMIN
    if (membership.user.role === 'PLATFORM_SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify Platform Super Admin account.' },
        { status: 400 }
      );
    }

    if (action === 'PROMOTE') {
      await prisma.organizationMembership.update({
        where: { id: membershipId },
        data: { role: 'ORGANIZATION_ADMIN' },
      });
      await prisma.user.update({
        where: { id: membership.userId },
        data: { role: 'ORGANIZATION_ADMIN' },
      });
    } else if (action === 'DEMOTE') {
      // Cannot demote ORGANIZATION_SUPER_ADMIN unless caller is PLATFORM_SUPER_ADMIN or self
      if (membership.role === 'ORGANIZATION_SUPER_ADMIN' && session.role !== 'PLATFORM_SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Cannot demote Organization Super Admin.' },
          { status: 400 }
        );
      }
      await prisma.organizationMembership.update({
        where: { id: membershipId },
        data: { role: 'MEMBER' },
      });
      await prisma.user.update({
        where: { id: membership.userId },
        data: { role: 'MEMBER' },
      });
    } else if (action === 'TOGGLE_ACTIVE') {
      if (membership.userId === session.id) {
        return NextResponse.json(
          { error: 'You cannot deactivate your own account.' },
          { status: 400 }
        );
      }
      const newActive = !membership.user.active;
      await prisma.user.update({
        where: { id: membership.userId },
        data: { active: newActive },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Member management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
