import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export type UserRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'ORGANIZATION_SUPER_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'MEMBER'
  | 'USER'
  | 'SUPER_ADMIN'
  | 'ADMIN';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string | null;
  organizationStatus?: string | null;
  orgIdCode?: string | null;
  organizationName?: string | null;
  organizationLogo?: string | null;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'sit-super-secret-jwt-key-2026-production';
  return new TextEncoder().encode(secret.trim());
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

  const verified = await verifySessionToken(token);
  if (!verified) return null;

  // Verify user in DB with relations
  const user = await prisma.user.findUnique({
    where: { id: verified.id },
    include: {
      organization: true,
      memberships: {
        where: { status: 'ACTIVE' },
        include: { organization: true },
      },
    },
  });

  if (!user || !user.active) return null;

  let effectiveOrgId = user.organizationId;
  let effectiveOrgStatus = user.organization?.status || null;
  let effectiveOrgIdCode = user.organization?.orgId || null;
  let effectiveOrgName = user.organization?.name || null;
  let effectiveOrgLogo = (user.organization as any)?.logoUrl || null;

  // If user has a membership and organizationId wasn't direct, pull from membership
  if (!effectiveOrgId && user.memberships.length > 0) {
    const primaryMembership = user.memberships[0];
    effectiveOrgId = primaryMembership.organizationId;
    effectiveOrgStatus = primaryMembership.organization.status;
    effectiveOrgIdCode = primaryMembership.organization.orgId;
    effectiveOrgName = primaryMembership.organization.name;
    effectiveOrgLogo = (primaryMembership.organization as any)?.logoUrl || null;
  }

  // Section 5 Rules:
  // REJECTED org status -> access denied
  if (effectiveOrgStatus === 'REJECTED' && user.role !== 'PLATFORM_SUPER_ADMIN') {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    organizationId: effectiveOrgId,
    organizationStatus: effectiveOrgStatus,
    orgIdCode: effectiveOrgIdCode,
    organizationName: effectiveOrgName,
    organizationLogo: effectiveOrgLogo,
  };
}

// Role Authorization Helpers
export function isPlatformSuperAdmin(session: AuthSession | null): boolean {
  return session?.role === 'PLATFORM_SUPER_ADMIN' || session?.role === 'SUPER_ADMIN';
}

export function isOrgSuperAdmin(session: AuthSession | null): boolean {
  return (
    session?.role === 'ORGANIZATION_SUPER_ADMIN' ||
    session?.role === 'PLATFORM_SUPER_ADMIN' ||
    session?.role === 'SUPER_ADMIN'
  );
}

export function isOrgAdmin(session: AuthSession | null): boolean {
  return (
    session?.role === 'ORGANIZATION_SUPER_ADMIN' ||
    session?.role === 'ORGANIZATION_ADMIN' ||
    session?.role === 'PLATFORM_SUPER_ADMIN' ||
    session?.role === 'SUPER_ADMIN' ||
    session?.role === 'ADMIN'
  );
}

export function isOrgMember(session: AuthSession | null): boolean {
  return (
    session?.role === 'ORGANIZATION_SUPER_ADMIN' ||
    session?.role === 'ORGANIZATION_ADMIN' ||
    session?.role === 'MEMBER' ||
    session?.role === 'PLATFORM_SUPER_ADMIN' ||
    session?.role === 'SUPER_ADMIN' ||
    session?.role === 'ADMIN'
  );
}

export function isSuspended(session: AuthSession | null): boolean {
  return session?.organizationStatus === 'SUSPENDED';
}
