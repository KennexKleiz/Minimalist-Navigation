import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取配置
    const configs: any[] = await prisma.$queryRaw`SELECT * FROM SiteConfig LIMIT 1`;
    const config = configs[0];

    // 获取所有分类、板块、站点和标签
    const categories = await prisma.category.findMany({
      include: {
        sections: {
          include: {
            sites: {
              include: {
                tags: true
              } as any
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    const tags = await (prisma as any).tag.findMany();

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config,
      categories,
      tags
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="daohang-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}