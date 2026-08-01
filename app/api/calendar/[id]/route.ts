import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin, isOrgMember, isPlatformSuperAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOrgMember(session) && !isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const entry = await prisma.calendarEntry.findUnique({
      where: { id: params.id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 });
    }

    // Strict Org Isolation check
    if (!isPlatformSuperAdmin(session) && entry.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching calendar entry:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar entry' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOrgMember(session) && !isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const existingEntry = await prisma.calendarEntry.findUnique({
      where: { id: params.id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 });
    }

    // Strict Org Isolation check
    if (!isPlatformSuperAdmin(session) && existingEntry.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const isAdmin = isOrgAdmin(session) || isPlatformSuperAdmin(session);

    // Section 24 rule: Members / Graphics Team can upload completed poster & mark POSTER_READY
    // Admins can update any field. Non-admin members can only upload poster creative & update status to POSTER_READY.
    if (!isAdmin) {
      if (body.status && body.status !== 'POSTER_READY' && body.status !== existingEntry.status) {
        return NextResponse.json(
          { error: 'Forbidden: Members can only update creative and mark items as POSTER_READY' },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};

    if (body.title !== undefined && isAdmin) updateData.title = body.title.trim();
    if (body.date !== undefined && isAdmin) updateData.date = new Date(body.date);
    if (body.targetTime !== undefined && isAdmin) updateData.targetTime = body.targetTime.trim();

    if (body.status !== undefined) {
      const validStatuses = ['PLANNED', 'POSTER_READY', 'POSTED', 'CANCELLED', 'DELAYED'];
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status;
      }
    }

    // Additional fields handling per status requirement
    if (body.creativeUrl !== undefined) updateData.creativeUrl = body.creativeUrl;
    if (body.creativeType !== undefined) updateData.creativeType = body.creativeType;

    if (body.actualPostedDate !== undefined) {
      updateData.actualPostedDate = body.actualPostedDate ? new Date(body.actualPostedDate) : null;
    }
    if (body.actualPostedTime !== undefined) {
      updateData.actualPostedTime = body.actualPostedTime || null;
    }

    if (body.cancellationReason !== undefined) {
      updateData.cancellationReason = body.cancellationReason || null;
    }

    if (body.newDate !== undefined) {
      updateData.newDate = body.newDate ? new Date(body.newDate) : null;
    }
    if (body.newTargetTime !== undefined) {
      updateData.newTargetTime = body.newTargetTime || null;
    }
    if (body.delayReason !== undefined) {
      updateData.delayReason = body.delayReason || null;
    }

    const updatedEntry = await prisma.calendarEntry.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating calendar entry:', error);
    return NextResponse.json({ error: 'Failed to update calendar entry' }, { status: 500 });
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

    // Only Organization Super Admins and Organization Admins can delete calendar entries
    if (!isOrgAdmin(session) && !isPlatformSuperAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden: Only Organization Admins can delete calendar entries' },
        { status: 403 }
      );
    }

    const existingEntry = await prisma.calendarEntry.findUnique({
      where: { id: params.id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 });
    }

    // Strict Org Isolation check
    if (!isPlatformSuperAdmin(session) && existingEntry.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    await prisma.calendarEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Calendar entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar entry:', error);
    return NextResponse.json({ error: 'Failed to delete calendar entry' }, { status: 500 });
  }
}
