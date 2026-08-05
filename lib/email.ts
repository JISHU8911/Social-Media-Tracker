import nodemailer from 'nodemailer';

// DEVELOPMENT ONLY
// Disable before production launch
export function isEmailTestMode(): boolean {
  const isTestMode = process.env.EMAIL_VERIFICATION_TEST_MODE === 'true';

  // Security check: Warn in server logs if test mode is enabled in production
  if (process.env.NODE_ENV === 'production' && isTestMode) {
    console.warn('\n=============================================================');
    console.warn('WARNING: Email Verification Test Mode is enabled in Production.');
    console.warn('=============================================================\n');
  }

  return isTestMode;
}

// DEVELOPMENT ONLY
// Disable before production launch
export function generateOtpCode(): string {
  if (isEmailTestMode()) {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface SendOtpResult {
  success: boolean;
  smtpConfigured: boolean;
  isTestMode?: boolean;
  error?: string;
}

export async function sendOtpEmail(
  email: string,
  code: string,
  type: 'MEMBER_SIGNUP' | 'ORG_REGISTRATION' | 'FORGOT_PASSWORD',
  orgName?: string
): Promise<SendOtpResult> {
  const appName = orgName || 'ClubHQ';

  // DEVELOPMENT ONLY
  // Disable before production launch
  if (isEmailTestMode()) {
    console.log('\n==================================================');
    console.log('[EMAIL VERIFICATION TEST MODE ACTIVE]');
    console.log(`To: ${email}`);
    console.log(`Type: ${type}`);
    console.log(`App Name: ${appName}`);
    console.log(`Fixed Verification Code: 123456`);
    console.log('No email sent.');
    console.log('==================================================\n');
    return { success: true, smtpConfigured: false, isTestMode: true };
  }

  const subject =
    type === 'ORG_REGISTRATION'
      ? `${appName} - Organization Email Verification Code`
      : type === 'FORGOT_PASSWORD'
      ? `${appName} - Password Reset Verification Code`
      : `${appName} - Member Account Email Verification Code`;

  const title =
    type === 'ORG_REGISTRATION'
      ? 'Organization Email Verification'
      : type === 'FORGOT_PASSWORD'
      ? 'Password Reset Verification'
      : 'Member Account Email Verification';

  const textMessage = `Your ${appName} verification code is: ${code}. This code will expire in 10 minutes.`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid rgba(36, 72, 85, 0.15); border-radius: 16px; background-color: #FFF8F5;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #244855; margin: 0; font-size: 22px; font-weight: 800;">${appName}</h2>
        <p style="color: #244855; opacity: 0.8; font-size: 13px; margin-top: 4px; font-weight: 600;">${title}</p>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid rgba(36, 72, 85, 0.1); text-align: center; margin-bottom: 20px;">
        <p style="font-size: 11px; color: #244855; opacity: 0.7; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Verification Code</p>
        <h1 style="font-size: 38px; color: #E64833; letter-spacing: 6px; margin: 0; font-family: monospace; font-weight: 800;">${code}</h1>
      </div>
      <p style="font-size: 13px; color: #244855; line-height: 1.5;">
        Please enter this code on the verification page to complete your request.
        This code is valid for <strong>10 minutes</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid rgba(36, 72, 85, 0.1); margin: 20px 0;" />
      <p style="font-size: 11px; color: #244855; opacity: 0.7; text-align: center;">
        If you did not request this verification code, please ignore this email.
      </p>
    </div>
  `;

  // Log to server console for dev monitoring
  console.log('\n==================================================');
  console.log(`[EMAIL OTP GENERATED]`);
  console.log(`To: ${email}`);
  console.log(`App: ${appName}`);
  console.log(`Type: ${type}`);
  console.log(`OTP Code: ${code}`);
  console.log('==================================================\n');

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${appName} Verification" <${smtpUser}>`,
        to: email,
        subject,
        text: textMessage,
        html: htmlMessage,
      });

      return { success: true, smtpConfigured: true, isTestMode: false };
    } catch (err: any) {
      console.error('Failed to send SMTP email:', err);
      return { success: false, smtpConfigured: true, isTestMode: false, error: err.message };
    }
  }

  return { success: true, smtpConfigured: false, isTestMode: false };
}
