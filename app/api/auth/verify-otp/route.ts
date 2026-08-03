import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isEmailTestMode } from '@/lib/email';

// DEVELOPMENT ONLY
// Disable before production launch
export async function POST(request: Request) {
  try {
    const { email, code, type } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    const isTestMode = isEmailTestMode();

    const record = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: cleanCode,
        type,
        expiresAt: { gt: new Date() },
      },
    });

    // In DEVELOPMENT test mode, accept 123456 as valid fallback
    const isValid = !!record || (isTestMode && cleanCode === '123456');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired 6-digit verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      isTestMode,
      message: 'Email verification code verified successfully',
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
