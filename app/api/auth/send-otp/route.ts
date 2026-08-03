import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtpCode, sendOtpEmail, isEmailTestMode } from '@/lib/email';

// DEVELOPMENT ONLY
// Disable before production launch
export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!['MEMBER_SIGNUP', 'ORG_REGISTRATION', 'FORGOT_PASSWORD'].includes(type)) {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }

    // Check account existence based on type
    if (type === 'MEMBER_SIGNUP') {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email address already exists' },
          { status: 400 }
        );
      }
    } else if (type === 'ORG_REGISTRATION') {
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
    } else if (type === 'FORGOT_PASSWORD') {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (!existingUser) {
        // Return friendly response without exposing user email enumeration
        return NextResponse.json({
          message: 'If an account exists, a verification code has been dispatched.',
          email: cleanEmail,
          isTestMode: isEmailTestMode(),
          testCode: isEmailTestMode() ? '123456' : undefined,
        });
      }
    }

    const isTestMode = isEmailTestMode();
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up older verification codes for this email and type
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail, type },
    });

    // Save code in database
    await prisma.verificationCode.create({
      data: {
        email: cleanEmail,
        code,
        type,
        expiresAt,
      },
    });

    // Dispatch email if not in test mode
    const sendResult = await sendOtpEmail(cleanEmail, code, type);

    return NextResponse.json({
      message: isTestMode
        ? 'Development Mode Enabled - Use verification code: 123456'
        : sendResult.smtpConfigured
        ? `A 6-digit verification code has been sent to ${cleanEmail}`
        : `Verification code generated. (SMTP not set in .env - code: ${code})`,
      email: cleanEmail,
      isTestMode,
      testCode: isTestMode ? '123456' : undefined,
      smtpConfigured: sendResult.smtpConfigured,
      devCode: sendResult.smtpConfigured ? undefined : code,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
