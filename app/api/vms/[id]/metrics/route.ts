import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, generateVMMetrics, delay } from '@/lib/mock-data';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay();
  const cookieStore = await cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const vm = db.getVM(id);
  if (!vm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const hours = Number(new URL(req.url).searchParams.get('hours') ?? '24');
  return NextResponse.json({ metrics: generateVMMetrics(id, hours) });
}
