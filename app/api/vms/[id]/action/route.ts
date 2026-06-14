import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay();
  const cookieStore = await cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const { action } = (await req.json()) as { action: 'start' | 'stop' | 'restart' };
  const vm = db.applyVMAction(id, action);
  if (!vm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ vm });
}
