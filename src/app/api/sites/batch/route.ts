import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, sites } = body;

    if (!sectionId || !Array.isArray(sites) || sites.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // 获取当前板块最大的 sortOrder
    const lastSite = await prisma.site.findFirst({
      where: { sectionId: parseInt(sectionId) },
      orderBy: { sortOrder: 'desc' },
    });

    let startSortOrder = (lastSite?.sortOrder || 0) + 1;

    // 使用事务确保原子性
    await prisma.$transaction(async (tx) => {
      for (const site of sites) {
        await tx.site.create({
          data: {
            title: site.title,
            url: site.url,
            description: site.description || '',
            icon: site.icon || '',
            sectionId: parseInt(sectionId),
            sortOrder: startSortOrder++,
          },
        });
      }
    });

    return NextResponse.json({ success: true, count: sites.length });
  } catch (error) {
    console.error('Batch import failed:', error);
    return NextResponse.json({ error: 'Batch import failed' }, { status: 500 });
  }
}