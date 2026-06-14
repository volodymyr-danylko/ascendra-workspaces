import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';
import type { VMTemplate } from '@/types';

export async function GET() {
  await delay();
  const cookieStore = await cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ templates: db.getTemplates() });
}

export async function POST(req: Request) {
  await delay();
  const cookieStore = await cookies();
  if (cookieStore.get('role')?.value !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = (await req.json()) as Omit<VMTemplate, 'id'>;
  const template = db.createTemplate(data);
  return NextResponse.json({ template }, { status: 201 });
}
