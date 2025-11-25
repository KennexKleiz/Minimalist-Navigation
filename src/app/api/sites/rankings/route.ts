import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const limit = 10;

    // 1. 推荐榜 (Most Liked)
    const recommended: any[] = await prisma.$queryRaw`SELECT * FROM Site ORDER BY likes DESC LIMIT ${limit}`;

    // 2. 点击榜 (Most Viewed)
    const popular: any[] = await prisma.$queryRaw`SELECT * FROM Site ORDER BY views DESC LIMIT ${limit}`;

    // 3. 新增榜 (Newest)
    const newest: any[] = await prisma.$queryRaw`SELECT * FROM Site ORDER BY createdAt DESC LIMIT ${limit}`;

    // 4. 随机榜 (Random)
    const random: any[] = await prisma.$queryRaw`SELECT * FROM Site ORDER BY RANDOM() LIMIT ${limit}`;

    return NextResponse.json({
      recommended,
      popular,
      newest,
      random
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}