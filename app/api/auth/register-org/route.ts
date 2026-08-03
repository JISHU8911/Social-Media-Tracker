import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';
import { isEmailTestMode } from '@/lib/email';
import crypto from 'crypto';

function generateUniqueCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { name, officialEmail, password, confirmPassword, otpCode } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    if (!officialEmail || !officialEmail.trim()) {
      return NextResponse.json({ error: 'Official email is required' }, { status: 400 });
    }

    const cleanEmail = officialEmail.toLowerCase().trim();
    const cleanOtp = (otpCode || '').trim();
    const isTestMode = isEmailTestMode();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (!cleanOtp) {
      return NextResponse.json({ error: '6-digit email verification code is required' }, { status: 400 });
    }

    // Verify OTP Code
    const otpRecord = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: cleanOtp,
        type: 'ORG_REGISTRATION',
        expiresAt: { gt: new Date() },
      },
    });

    const isOtpValid = !!otpRecord || (isTestMode && cleanOtp === '123456');

    if (!isOtpValid) {
      return NextResponse.json(
        { error: 'Invalid or expired 6-digit email verification code' },
        { status: 400 }
      );
    }

    // Check existing org or user email conflict
    const existingOrg = await prisma.organization.findUnique({
      where: { officialEmail: cleanEmail },
    });
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingOrg || existingUser) {
      return NextResponse.json(
        { error: 'An organization or user account with this official email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Generate Organization ID (e.g. ORG-1001)
    const orgCount = await prisma.organization.count();
    const formattedOrgId = `ORG-${1001 + orgCount}`;

    // Generate Unique Code
    let uniqueCode = generateUniqueCode(8);
    let codeExists = await prisma.organization.findUnique({ where: { uniqueCode } });
    while (codeExists) {
      uniqueCode = generateUniqueCode(8);
      codeExists = await prisma.organization.findUnique({ where: { uniqueCode } });
    }

    // STEP 1: Automatically create the organization with ACTIVE status
    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        officialEmail: cleanEmail,
        passwordHash,
        orgId: formattedOrgId,
        uniqueCode,
        status: 'ACTIVE',
      },
    });

    // STEP 2: Automatically create the first Organization Super Admin account
    const user = await prisma.user.create({
      data: {
        name: `${name.trim()} Admin`,
        email: cleanEmail,
        passwordHash,
        role: 'ORGANIZATION_SUPER_ADMIN',
        organizationId: organization.id,
        active: true,
      },
    });

    // Create Organization Membership
    await prisma.organizationMembership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: 'ORGANIZATION_SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    // Clean up used OTP codes
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail, type: 'ORG_REGISTRATION' },
    });

    // STEP 3: Automatically log the user in by generating session token
    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'ORGANIZATION_SUPER_ADMIN' as const,
      organizationId: organization.id,
      organizationName: organization.name,
      orgIdCode: organization.orgId,
    };

    const token = await createSessionToken(sessionPayload);

    // STEP 4: Return response with cookie set & redirect URL
    const response = NextResponse.json(
      {
        message: 'Organization created successfully.',
        redirectUrl: '/organization/dashboard',
        user: sessionPayload,
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Register Org error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
