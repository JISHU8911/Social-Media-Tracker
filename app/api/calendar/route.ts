import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isOrgAdmin, isOrgMember, isPlatformSuperAdmin } from '@/lib/auth';

function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [_, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  }
  return new Date(dateStr);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOrgMember(session) && !isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    let where: any = {};
    if (!isPlatformSuperAdmin(session)) {
      if (!session.organizationId) {
        return NextResponse.json([]);
      }
      where.organizationId = session.organizationId;
    } else {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get('organizationId');
      if (orgId) {
        where.organizationId = orgId;
      }
    }

    const calendarEntries = await prisma.calendarEntry.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(calendarEntries);
  } catch (error) {
    console.error('Error fetching calendar entries:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOrgAdmin(session) || !session.organizationId) {
      return NextResponse.json(
        { error: 'Forbidden: Only Organization Admins can create calendar entries' },
        { status: 403 }
      );
    }

    const {
      title,
      date,
      targetTime,
      status,
      creativeUrl,
      creativeType,
      caption,
      actualPostedDate,
      actualPostedTime,
      cancellationReason,
      newDate,
      newTargetTime,
      delayReason,
    } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!targetTime) {
      return NextResponse.json({ error: 'Target time is required' }, { status: 400 });
    }

    const validStatuses = ['PLANNED', 'POSTER_READY', 'POSTED', 'CANCELLED', 'DELAYED'];
    const entryStatus = status && validStatuses.includes(status) ? status : 'PLANNED';

    const entry = await prisma.calendarEntry.create({
      data: {
        organizationId: session.organizationId,
        title: title.trim(),
        date: parseLocalDate(date),
        targetTime: targetTime.trim(),
        status: entryStatus,
        creativeUrl: creativeUrl || null,
        creativeType: creativeType || null,
        caption: caption || null,
        actualPostedDate: actualPostedDate ? parseLocalDate(actualPostedDate) : null,
        actualPostedTime: actualPostedTime || null,
        cancellationReason: cancellationReason || null,
        newDate: newDate ? parseLocalDate(newDate) : null,
        newTargetTime: newTargetTime || null,
        delayReason: delayReason || null,
        createdBy: session.name,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar entry:', error);
    return NextResponse.json({ error: 'Failed to create calendar entry' }, { status: 500 });
  }
}
