import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst();
    return NextResponse.json(config || { title: '极简智能导航', subtitle: '探索数字世界的无限可能' });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle } = body;

    const config = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: { title, subtitle },
      create: { title, subtitle },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}