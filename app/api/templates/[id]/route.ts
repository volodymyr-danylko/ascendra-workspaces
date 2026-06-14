import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';
import type { VMTemplate } from '@/types';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay();
  const cookieStore = await cookies();
  if (cookieStore.get('role')?.value !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const data = (await req.json()) as Partial<Omit<VMTemplate, 'id'>>;
  const template = db.updateTemplate(id, data);
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ template });
}
