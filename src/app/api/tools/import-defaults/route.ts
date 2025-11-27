import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// 导入内置工具的数据定义
import { getDefaultTools } from './defaultTools';

export async function POST() {
  try {
    // 验证管理员权限
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken || authToken.value !== 'admin_logged_in') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查是否已有工具数据
    const existingToolsCount = await prisma.tool.count();
    const existingCategoriesCount = await prisma.toolCategory.count();

    if (existingToolsCount > 0 || existingCategoriesCount > 0) {
      return NextResponse.json({
        error: '检测到现有数据',
        message: `当前已有 ${existingCategoriesCount} 个工具分类和 ${existingToolsCount} 个工具。为保护数据，请先清空所有工具后再导入。`,
        existingToolsCount,
        existingCategoriesCount
      }, { status: 400 });
    }

    // 获取默认工具数据
    const defaultTools = getDefaultTools();

    let importedCount = 0;
    let categoriesCreated = 0;

    // 创建工具分类并导入工具
    for (const categoryData of defaultTools) {
      const category = await prisma.toolCategory.create({
        data: {
          name: categoryData.name,
          sortOrder: categoryData.sortOrder,
        },
      });
      categoriesCreated++;

      // 创建该分类下的所有工具
      for (const tool of categoryData.tools) {
        await prisma.tool.create({
          data: {
            name: tool.name,
            description: tool.description,
            icon: tool.icon,
            code: tool.code,
            categoryId: category.id,
            sortOrder: tool.sortOrder,
          },
        });
        importedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${categoriesCreated} 个分类和 ${importedCount} 个内置工具`,
      categoriesCreated,
      toolsImported: importedCount
    });

  } catch (error) {
    console.error('导入内置工具失败:', error);
    return NextResponse.json({
      error: '导入失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
