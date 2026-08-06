import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession, createSessionToken, UserRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = await request.json();
    if (!organizationId || typeof organizationId !== 'string') {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Verify active membership in target organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: session.id,
        organizationId: organizationId,
        status: 'ACTIVE',
        organization: {
          status: 'ACTIVE',
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have active membership in this organization' },
        { status: 403 }
      );
    }

    const isPlatformSuperAdminUser = session.role === 'PLATFORM_SUPER_ADMIN' || session.role === 'SUPER_ADMIN';
    const newRole = (isPlatformSuperAdminUser ? session.role : membership.role) as UserRole;

    // Update active organizationId and role on User table
    await prisma.user.update({
      where: { id: session.id },
      data: {
        organizationId: membership.organizationId,
        role: newRole,
      },
    });

    const updatedSessionPayload = {
      id: session.id,
      name: session.name,
      email: session.email,
      role: newRole,
      organizationId: membership.organization.id,
      organizationStatus: membership.organization.status,
      orgIdCode: membership.organization.orgId,
      organizationName: membership.organization.displayName || membership.organization.name,
      organizationLogo: membership.organization.logoUrl,
    };

    // Issue updated auth token cookie
    const token = await createSessionToken(updatedSessionPayload);
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      message: 'Switched organization successfully',
      user: updatedSessionPayload,
    });
  } catch (error: any) {
    console.error('Switch organization error:', error);
    return NextResponse.json({ error: error.message || 'Failed to switch organization' }, { status: 500 });
  }
}
