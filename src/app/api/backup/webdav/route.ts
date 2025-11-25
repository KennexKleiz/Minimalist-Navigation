import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from 'webdav';

async function getWebDAVClient() {
  const configs: any[] = await prisma.$queryRaw`SELECT * FROM SiteConfig LIMIT 1`;
  const config = configs[0];

  if (!config || !config.webdavUrl || !config.webdavUsername || !config.webdavPassword) {
    throw new Error('WebDAV not configured');
  }

  return createClient(config.webdavUrl, {
    username: config.webdavUsername,
    password: config.webdavPassword
  });
}

export async function POST(request: Request) {
  try {
    const { action, filename } = await request.json();

    if (action === 'test') {
      const client = await getWebDAVClient();
      // 10秒超时
      await Promise.race([
        client.getDirectoryContents('/'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000))
      ]);
      return NextResponse.json({ success: true });
    }

    if (action === 'list') {
      const client = await getWebDAVClient();
      const contents = await client.getDirectoryContents('/');
      const backups = (contents as any[])
        .filter(item => item.basename.startsWith('daohang-backup-') && item.basename.endsWith('.json'))
        .map(item => ({
          name: item.basename,
          lastMod: item.lastmod,
          size: item.size
        }))
        .sort((a, b) => new Date(b.lastMod).getTime() - new Date(a.lastMod).getTime());
      return NextResponse.json({ backups });
    }

    if (action === 'upload') {
      const client = await getWebDAVClient();
      
      // 获取当前备份数据
      const configs: any[] = await prisma.$queryRaw`SELECT * FROM SiteConfig LIMIT 1`;
      const config = configs[0];
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

      const backupFilename = `daohang-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      await client.putFileContents(`/${backupFilename}`, JSON.stringify(backupData, null, 2));
      
      return NextResponse.json({ success: true, filename: backupFilename });
    }

    if (action === 'download') {
      if (!filename) return NextResponse.json({ error: 'Filename required' }, { status: 400 });
      
      const client = await getWebDAVClient();
      const content = await client.getFileContents(`/${filename}`, { format: 'text' });
      
      return NextResponse.json({ content: JSON.parse(content as string) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('WebDAV error:', error);
    return NextResponse.json({ error: error.message || 'WebDAV operation failed' }, { status: 500 });
  }
}