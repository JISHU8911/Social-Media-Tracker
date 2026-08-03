import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';
import { isEmailTestMode } from '@/lib/email';

// DEVELOPMENT ONLY
// Disable before production launch
export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword, otpCode } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
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

    // Verify OTP Code in Database
    const otpRecord = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: cleanOtp,
        type: 'MEMBER_SIGNUP',
        expiresAt: { gt: new Date() },
      },
    });

    // Accept DB record match OR 123456 if test mode is enabled
    const isOtpValid = !!otpRecord || (isTestMode && cleanOtp === '123456');

    if (!isOtpValid) {
      return NextResponse.json(
        { error: 'Invalid or expired 6-digit email verification code' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'USER',
        active: true,
      },
    });

    // Clean up used OTP codes
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail, type: 'MEMBER_SIGNUP' },
    });

    const sessionPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'USER' as const,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json(
      {
        message: 'Account created and email verified successfully',
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
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
