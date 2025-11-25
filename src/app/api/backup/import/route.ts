import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { config, categories, tags } = data;

    // 1. 恢复配置
    if (config) {
      const { id, updatedAt, ...configData } = config;
      // 使用 raw query 更新，因为 Prisma Client 可能未更新
      await prisma.$executeRaw`
        UPDATE SiteConfig
        SET title = ${configData.title},
            subtitle = ${configData.subtitle},
            gridColumns = ${configData.gridColumns},
            truncateDescription = ${configData.truncateDescription ? 1 : 0},
            containerMaxWidth = ${configData.containerMaxWidth},
            favicon = ${configData.favicon || null},
            backgroundImage = ${configData.backgroundImage || null},
            backgroundImages = ${configData.backgroundImages || '[]'},
            backgroundMode = ${configData.backgroundMode || 'fixed'},
            footerHtml = ${configData.footerHtml || null},
            webdavUrl = ${configData.webdavUrl || null},
            webdavUsername = ${configData.webdavUsername || null},
            webdavPassword = ${configData.webdavPassword || null},
            updatedAt = ${new Date()}
        WHERE id = 1
      `;
    }

    // 2. 恢复标签 (先清空再创建)
    if (tags && Array.isArray(tags)) {
      await (prisma as any).tag.deleteMany();
      for (const tag of tags) {
        const { id, createdAt, updatedAt, ...tagData } = tag;
        // 检查标签是否已存在（防止重复）
        const existingTag = await (prisma as any).tag.findUnique({ where: { name: tagData.name } });
        if (!existingTag) {
            await (prisma as any).tag.create({ data: tagData });
        }
      }
    }

    // 3. 恢复分类、板块和站点 (先清空再创建)
    if (categories && Array.isArray(categories)) {
      // 删除所有分类（级联删除板块和站点）
      await prisma.category.deleteMany();

      for (const category of categories) {
        const { id, sections, createdAt, updatedAt, ...categoryData } = category;
        
        const newCategory = await prisma.category.create({
          data: categoryData
        });

        if (sections && Array.isArray(sections)) {
          for (const section of sections) {
            const { id, sites, categoryId, createdAt, updatedAt, ...sectionData } = section;
            
            const newSection = await prisma.section.create({
              data: {
                ...sectionData,
                categoryId: newCategory.id
              }
            });

            if (sites && Array.isArray(sites)) {
              for (const site of sites) {
                const { id, sectionId, tags, likesList, createdAt, updatedAt, ...siteData } = site;
                
                // 处理标签关联
                const tagConnect = tags ? tags.map((t: any) => ({ name: t.name })) : [];

                await prisma.site.create({
                  data: {
                    ...siteData,
                    sectionId: newSection.id,
                    tags: {
                      connect: tagConnect
                    }
                  }
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}