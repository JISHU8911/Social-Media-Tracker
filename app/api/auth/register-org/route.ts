import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, officialEmail, password, confirmPassword } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    if (!officialEmail || !officialEmail.trim()) {
      return NextResponse.json({ error: 'Official email is required' }, { status: 400 });
    }

    const cleanEmail = officialEmail.toLowerCase().trim();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check existing org or user email conflict
    const existingOrg = await prisma.organization.findUnique({
      where: { officialEmail: cleanEmail },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'An organization with this official email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        officialEmail: cleanEmail,
        passwordHash,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Organization registration submitted successfully. Pending Platform Super Admin approval.',
        organization: {
          id: organization.id,
          name: organization.name,
          officialEmail: organization.officialEmail,
          status: organization.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register Org error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
