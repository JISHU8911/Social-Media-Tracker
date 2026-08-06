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

  // Platform Super Admins override organization-level roles
  const isPlatformSuperAdminUser = user.role === 'PLATFORM_SUPER_ADMIN' || user.role === 'SUPER_ADMIN';

  let effectiveOrgId: string | null = user.organizationId;
  let activeMembership = user.memberships.find((m) => m.organizationId === effectiveOrgId);

  // If current active organizationId has no active membership (e.g. removed or reset), fallback to first active membership
  if (!activeMembership && user.memberships.length > 0) {
    activeMembership = user.memberships[0];
    effectiveOrgId = activeMembership.organizationId;
    // Persist auto-fallback active org to User record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: effectiveOrgId,
        role: isPlatformSuperAdminUser ? user.role : activeMembership.role,
      },
    }).catch(() => {});
  }

  let effectiveRole: UserRole = (isPlatformSuperAdminUser ? user.role : 'MEMBER') as UserRole;
  let effectiveOrgStatus: string | null = null;
  let effectiveOrgIdCode: string | null = null;
  let effectiveOrgName: string | null = null;
  let effectiveOrgLogo: string | null = null;

  if (activeMembership) {
    const org = activeMembership.organization;
    effectiveOrgId = org.id;
    effectiveOrgStatus = org.status;
    effectiveOrgIdCode = org.orgId;
    effectiveOrgName = org.displayName || org.name;
    effectiveOrgLogo = org.logoUrl || null;
    if (!isPlatformSuperAdminUser) {
      effectiveRole = activeMembership.role as UserRole;
    }
  } else if (user.organization) {
    const org = user.organization;
    effectiveOrgStatus = org.status;
    effectiveOrgIdCode = org.orgId;
    effectiveOrgName = org.displayName || org.name;
    effectiveOrgLogo = org.logoUrl || null;
    if (!isPlatformSuperAdminUser) {
      effectiveRole = user.role as UserRole;
    }
  } else if (isPlatformSuperAdminUser) {
    effectiveRole = user.role as UserRole;
  }

  // Section 5 Rules: REJECTED org status -> access denied
  if (effectiveOrgStatus === 'REJECTED' && !isPlatformSuperAdminUser) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: effectiveRole,
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
