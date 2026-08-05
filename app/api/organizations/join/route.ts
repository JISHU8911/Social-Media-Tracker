import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, hashPassword, verifyPassword, createSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    let session = await getServerSession();
    const body = await request.json();
    const { name, email, password, confirmPassword, orgId, uniqueCode, designationId } = body;

    if (!orgId || !uniqueCode) {
      return NextResponse.json(
        { error: 'Organization ID and Unique Code are required' },
        { status: 400 }
      );
    }

    const cleanOrgId = orgId.trim().toUpperCase();
    const cleanCode = uniqueCode.trim().toUpperCase();

    // 1. Verify Organization exists and is active
    const organization = await prisma.organization.findFirst({
      where: {
        orgId: cleanOrgId,
        uniqueCode: cleanCode,
      },
    });

    if (!organization || organization.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid or inactive Organization ID or Unique Code' },
        { status: 400 }
      );
    }

    let targetUserId = session?.id;
    let isNewAccountCreated = false;

    // 2. If user is not logged in, perform account validation and creation
    if (!targetUserId) {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Full Name is required' }, { status: 400 });
      }
      if (!email || !email.trim()) {
        return NextResponse.json({ error: 'Email Address is required' }, { status: 400 });
      }
      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
      }

      const cleanEmail = email.toLowerCase().trim();
      let existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        const isPasswordValid = await verifyPassword(password, existingUser.passwordHash);
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'An account with this email already exists. Please log in or verify your password.' },
            { status: 400 }
          );
        }
        targetUserId = existingUser.id;
      } else {
        const passwordHash = await hashPassword(password);
        const newUser = await prisma.user.create({
          data: {
            name: name.trim(),
            email: cleanEmail,
            passwordHash,
            role: 'MEMBER',
          },
        });
        targetUserId = newUser.id;
        isNewAccountCreated = true;
      }

      // Create session cookie for newly registered user
      const dbUser = existingUser || (await prisma.user.findUnique({ where: { id: targetUserId } }));
      if (dbUser) {
        const token = await createSessionToken({
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as any,
          organizationId: dbUser.organizationId,
        });

        cookies().set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    // 3. Resolve Designation
    let resolvedDesignationId = designationId;

    if (resolvedDesignationId) {
      const designation = await prisma.designation.findFirst({
        where: {
          id: resolvedDesignationId,
          organizationId: organization.id,
          active: true,
        },
      });
      if (!designation) {
        return NextResponse.json(
          { error: 'Selected designation is invalid for this organization' },
          { status: 400 }
        );
      }
    } else {
      // Find first available active designation or create a default one
      let defaultDesignation = await prisma.designation.findFirst({
        where: { organizationId: organization.id, active: true },
      });

      if (!defaultDesignation) {
        defaultDesignation = await prisma.designation.create({
          data: {
            organizationId: organization.id,
            designationName: 'Member',
            active: true,
          },
        });
      }
      resolvedDesignationId = defaultDesignation.id;
    }

    // 4. Create or update JoinRequest
    const joinRequest = await prisma.joinRequest.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: targetUserId!,
        },
      },
      update: {
        designationId: resolvedDesignationId,
        status: 'PENDING',
      },
      create: {
        organizationId: organization.id,
        userId: targetUserId!,
        designationId: resolvedDesignationId,
        status: 'PENDING',
      },
    });

    const successMessage = isNewAccountCreated
      ? 'Your account has been created successfully.\nYour request has been sent to the organization admins.\nYou will gain access after approval.'
      : `Your request has been sent to ${organization.name} organization admins. You will gain access after approval.`;

    return NextResponse.json({
      message: successMessage,
      accountCreated: isNewAccountCreated,
      joinRequest,
    });
  } catch (error) {
    console.error('Submit join request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
