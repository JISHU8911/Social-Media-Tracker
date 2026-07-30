import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isPlatformSuperAdmin } from '@/lib/auth';
import crypto from 'crypto';

function generateUniqueCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!isPlatformSuperAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orgId = params.id;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Generate Organization ID: e.g. ORG-1001
    const count = await prisma.organization.count({
      where: { orgId: { not: null } },
    });
    const formattedOrgId = `ORG-${1001 + count}`;

    // Generate Unique Code
    let uniqueCode = generateUniqueCode(8);
    let codeExists = await prisma.organization.findUnique({ where: { uniqueCode } });
    while (codeExists) {
      uniqueCode = generateUniqueCode(8);
      codeExists = await prisma.organization.findUnique({ where: { uniqueCode } });
    }

    // Check if user account with officialEmail exists or create Organization Super Admin
    let user = await prisma.user.findUnique({
      where: { email: org.officialEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `${org.name} Admin`,
          email: org.officialEmail,
          passwordHash: org.passwordHash || '',
          role: 'ORGANIZATION_SUPER_ADMIN',
          active: true,
          organizationId: org.id,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'ORGANIZATION_SUPER_ADMIN',
          organizationId: org.id,
          active: true,
        },
      });
    }

    // Update organization with orgId, uniqueCode, status ACTIVE
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        orgId: formattedOrgId,
        uniqueCode,
        status: 'ACTIVE',
      },
    });

    // Upsert OrganizationMembership
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
      update: {
        role: 'ORGANIZATION_SUPER_ADMIN',
        status: 'ACTIVE',
      },
      create: {
        organizationId: org.id,
        userId: user.id,
        role: 'ORGANIZATION_SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      message: 'Organization approved successfully',
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        orgId: updatedOrg.orgId,
        uniqueCode: updatedOrg.uniqueCode,
        status: updatedOrg.status,
      },
    });
  } catch (error) {
    console.error('Approve org error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
