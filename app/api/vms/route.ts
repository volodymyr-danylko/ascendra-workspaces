import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function GET() {
  await delay();
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const role = cookieStore.get('role')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const vms = role === 'admin' ? db.getAllVMs() : db.getVMsByOwner(userId);
  return NextResponse.json({ vms });
}
