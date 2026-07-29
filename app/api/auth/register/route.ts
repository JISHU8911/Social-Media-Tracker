import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Public registration is disabled. Only system Super Admins can create user accounts.' },
    { status: 403 }
  );
}
