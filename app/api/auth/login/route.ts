import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, UserRole } from '@/lib/auth';

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

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        organization: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: { organization: true },
        },
      },
    });

    // Backward compatibility: If no User record exists, check if an Organization was registered with this email
    if (!user) {
      const registeredOrg = await prisma.organization.findUnique({
        where: { officialEmail: cleanEmail },
      });

      if (registeredOrg && registeredOrg.passwordHash) {
        const isValidOrgPass = await verifyPassword(password, registeredOrg.passwordHash);
        if (isValidOrgPass) {
          // Create User account for the registered organization
          user = await prisma.user.create({
            data: {
              name: `${registeredOrg.name} Admin`,
              email: cleanEmail,
              passwordHash: registeredOrg.passwordHash,
              role: 'ORGANIZATION_SUPER_ADMIN',
              organizationId: registeredOrg.id,
              active: true,
            },
            include: {
              organization: true,
              memberships: {
                where: { status: 'ACTIVE' },
                include: { organization: true },
              },
            },
          });
        }
      }
    }

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // SECURITY COMPLIANCE: Authenticate STRICTLY against user.passwordHash using bcrypt.compare
    const isValidPassword = await verifyPassword(password, user.passwordHash);

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
    // If Organization status is PENDING and user is not Platform Super Admin
    if (
      effectiveOrgStatus === 'PENDING' &&
      user.role !== 'PLATFORM_SUPER_ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        {
          error:
            'Your organization registration is currently PENDING approval from the Platform Super Admin. Access will be unlocked as soon as your registration is approved.',
        },
        { status: 403 }
      );
    }

    // REJECTED org access denied
    if (
      effectiveOrgStatus === 'REJECTED' &&
      user.role !== 'PLATFORM_SUPER_ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
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
