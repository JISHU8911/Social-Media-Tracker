import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

// Production Security Enforcement: Require JWT_SECRET from environment variables
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error(
      'FATAL SECURITY EXCEPTION: JWT_SECRET environment variable is missing. Startup halted.'
    );
  }
  return new TextEncoder().encode(secret.trim());
}

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: AuthSession): Promise<string> {
  const secretKey = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const secretKey = getJwtSecret();
    const verified = await jwtVerify(token, secretKey);
    return verified.payload as unknown as AuthSession;
  } catch (error) {
    return null;
  }
}

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  // Verify user is active in DB
  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user || !user.active) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as 'SUPER_ADMIN' | 'ADMIN',
  };
}
