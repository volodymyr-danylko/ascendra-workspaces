import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function POST(req: Request) {
  await delay();
  const { email } = await req.json();
  const user = db.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set('userId', user.id, { httpOnly: true, path: '/', sameSite: 'lax' });
  cookieStore.set('role', user.role, { httpOnly: true, path: '/', sameSite: 'lax' });
  return NextResponse.json({ user });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  return NextResponse.json({ ok: true });
}
