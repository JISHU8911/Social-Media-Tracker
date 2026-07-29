import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, hashPassword } from '@/lib/auth';

// GET list users (Super Admin only)
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create admin (Super Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const formattedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: formattedEmail,
        passwordHash,
        role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT edit user / toggle active status (Super Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const { id, name, email, active, password, role } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Super Admin Self-Protection Safeguards
    if (id === session.id) {
      if (active !== undefined && Boolean(active) === false) {
        return NextResponse.json(
          { error: 'Forbidden. You cannot deactivate your own Super Admin account.' },
          { status: 400 }
        );
      }
      if (role && role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden. You cannot remove your own Super Admin role.' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (active !== undefined) updateData.active = Boolean(active);
    if (role && (role === 'SUPER_ADMIN' || role === 'ADMIN')) updateData.role = role;
    if (password && password.trim()) {
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user (Super Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID parameter is required' }, { status: 400 });
    }

    // Super Admin Self-Protection Safeguard
    if (id === session.id) {
      return NextResponse.json(
        { error: 'Forbidden. You cannot delete your own Super Admin account.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 });
  }
}
