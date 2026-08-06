import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession, isOrgSuperAdmin, createSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isOrgSuperAdmin(session)) {
      return NextResponse.json(
        { error: 'Only Organization Super Admin can modify organization settings.' },
        { status: 403 }
      );
    }

    const { displayName } = await request.json();
    const cleanDisplayName = typeof displayName === 'string' && displayName.trim() ? displayName.trim() : null;

    const updatedOrg = await prisma.organization.update({
      where: { id: session.organizationId },
      data: { displayName: cleanDisplayName },
    });

    const effectiveName = updatedOrg.displayName || updatedOrg.name;

    // Issue updated auth token cookie with new organizationName
    const updatedSessionPayload = {
      ...session,
      organizationName: effectiveName,
    };

    const token = await createSessionToken(updatedSessionPayload);
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      message: 'Organization settings updated successfully',
      displayName: updatedOrg.displayName,
      organizationName: effectiveName,
    });
  } catch (error: any) {
    console.error('Update org settings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
