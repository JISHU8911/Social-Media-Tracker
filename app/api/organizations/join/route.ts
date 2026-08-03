import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { orgId, uniqueCode, designationId } = await request.json();

    if (!orgId || !uniqueCode || !designationId) {
      return NextResponse.json(
        { error: 'Organization ID, Unique Code, and Designation selection are required' },
        { status: 400 }
      );
    }

    const cleanOrgId = orgId.trim().toUpperCase();
    const cleanCode = uniqueCode.trim().toUpperCase();

    const organization = await prisma.organization.findFirst({
      where: {
        orgId: cleanOrgId,
        uniqueCode: cleanCode,
      },
    });

    if (!organization || organization.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid or inactive Organization' },
        { status: 400 }
      );
    }

    // Check if a pending join request already exists for this user and organization
    const existingPending = await prisma.joinRequest.findFirst({
      where: {
        organizationId: organization.id,
        userId: session.id,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: `Joining Request Already sent to ${organization.name}` },
        { status: 400 }
      );
    }

    // Verify designation belongs to this organization
    const designation = await prisma.designation.findFirst({
      where: {
        id: designationId,
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

    // Create or update JoinRequest
    const joinRequest = await prisma.joinRequest.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: session.id,
        },
      },
      update: {
        designationId: designation.id,
        status: 'PENDING',
      },
      create: {
        organizationId: organization.id,
        userId: session.id,
        designationId: designation.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: `Join request submitted successfully to ${organization.name}. Awaiting organization admin approval.`,
      joinRequest,
    });
  } catch (error) {
    console.error('Submit join request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
