import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, createSessionToken, UserRole } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        organization: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: { organization: true },
        },
      },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    let isValidPassword = await verifyPassword(password, user.passwordHash);

    // Fallback sync for Super Admin if SUPER_ADMIN_PASSWORD env variable is set on Vercel/server
    const isSuperAdminEmail =
      cleanEmail === (process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim() || 'admin@sit.com');

    if (
      !isValidPassword &&
      (isSuperAdminEmail || user.role === 'PLATFORM_SUPER_ADMIN' || user.role === 'SUPER_ADMIN')
    ) {
      const envSuperAdminPass = process.env.SUPER_ADMIN_PASSWORD?.trim();
      if (envSuperAdminPass && password === envSuperAdminPass) {
        isValidPassword = true;
        const newHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash, role: 'PLATFORM_SUPER_ADMIN' },
        });
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    let effectiveOrgId = user.organizationId;
    let effectiveOrgStatus = user.organization?.status || null;
    let effectiveOrgIdCode = user.organization?.orgId || null;
    let effectiveOrgName = user.organization?.name || null;

    if (!effectiveOrgId && user.memberships.length > 0) {
      const primaryMembership = user.memberships[0];
      effectiveOrgId = primaryMembership.organizationId;
      effectiveOrgStatus = primaryMembership.organization.status;
      effectiveOrgIdCode = primaryMembership.organization.orgId;
      effectiveOrgName = primaryMembership.organization.name;
    }

    // Section 5 Rules:
    // REJECTED org access denied
    if (effectiveOrgStatus === 'REJECTED' && user.role !== 'PLATFORM_SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied: Organization registration was rejected.' },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      organizationId: effectiveOrgId,
      organizationStatus: effectiveOrgStatus,
      orgIdCode: effectiveOrgIdCode,
      organizationName: effectiveOrgName,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      message: 'Login successful',
      user: sessionPayload,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
