import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });
    }

    if (type === 'like') {
      // 获取 IP 地址
      const headersList = await headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

      // 检查是否已经点赞
      // 使用 raw query 检查 Like 表
      const existingLikes: any[] = await prisma.$queryRaw`SELECT id FROM Like WHERE siteId = ${parseInt(id)} AND ip = ${ip}`;
      
      if (existingLikes.length > 0) {
        return NextResponse.json({ error: 'Already liked' }, { status: 429 });
      }

      // 记录点赞
      await prisma.$executeRaw`INSERT INTO Like (siteId, ip, createdAt) VALUES (${parseInt(id)}, ${ip}, ${new Date()})`;
      
      // 更新 Site likes
      await prisma.$executeRaw`UPDATE Site SET likes = likes + 1 WHERE id = ${parseInt(id)}`;
    } else if (type === 'view') {
      // 使用 raw query 更新 views
      await prisma.$executeRaw`UPDATE Site SET views = views + 1 WHERE id = ${parseInt(id)}`;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // 获取更新后的数据
    const sites: any[] = await prisma.$queryRaw`SELECT likes, views FROM Site WHERE id = ${parseInt(id)}`;
    const updatedSite = sites[0];

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Error interacting with site:', error);
    return NextResponse.json({ error: 'Interaction failed' }, { status: 500 });
  }
}