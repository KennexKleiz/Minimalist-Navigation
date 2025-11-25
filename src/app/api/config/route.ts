import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 使用 raw query 获取配置，确保能获取到新字段
    const configs: any[] = await prisma.$queryRaw`SELECT * FROM SiteConfig LIMIT 1`;
    const config = configs[0];
    
    return NextResponse.json(config || {
      title: '极简智能导航',
      subtitle: '探索数字世界的无限可能',
      gridColumns: 4,
      truncateDescription: true,
      containerMaxWidth: '1440px',
      favicon: '',
      backgroundImage: '',
      backgroundImages: '[]',
      backgroundMode: 'fixed'
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      gridColumns,
      truncateDescription,
      containerMaxWidth,
      favicon,
      backgroundImage,
      backgroundImages,
      backgroundMode
    } = body;

    // 使用 raw query 更新配置
    const existing: any[] = await prisma.$queryRaw`SELECT id FROM SiteConfig WHERE id = 1`;
    
    let config;
    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE SiteConfig
        SET title = ${title},
            subtitle = ${subtitle},
            gridColumns = ${gridColumns},
            truncateDescription = ${truncateDescription ? 1 : 0},
            containerMaxWidth = ${containerMaxWidth},
            favicon = ${favicon || null},
            backgroundImage = ${backgroundImage || null},
            backgroundImages = ${backgroundImages || '[]'},
            backgroundMode = ${backgroundMode || 'fixed'},
            updatedAt = ${new Date()}
        WHERE id = 1
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO SiteConfig (id, title, subtitle, gridColumns, truncateDescription, containerMaxWidth, favicon, backgroundImage, backgroundImages, backgroundMode, updatedAt)
        VALUES (1, ${title}, ${subtitle}, ${gridColumns}, ${truncateDescription ? 1 : 0}, ${containerMaxWidth}, ${favicon || null}, ${backgroundImage || null}, ${backgroundImages || '[]'}, ${backgroundMode || 'fixed'}, ${new Date()})
      `;
    }
    
    // 获取更新后的配置返回
    const configs: any[] = await prisma.$queryRaw`SELECT * FROM SiteConfig WHERE id = 1`;
    config = configs[0];

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}