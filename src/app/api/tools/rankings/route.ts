import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取点赞最多的工具（前10个）
    const topLiked = await prisma.tool.findMany({
      orderBy: { likes: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        likes: true,
        views: true,
      }
    });

    // 获取浏览最多的工具（前10个）
    const topViewed = await prisma.tool.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        likes: true,
        views: true,
      }
    });

    return NextResponse.json({
      topLiked,
      topViewed
    });
  } catch (error) {
    console.error('Failed to fetch tool rankings:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}
