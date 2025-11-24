import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        sections: {
          include: {
            sites: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // 检查是否是管理员请求（通过 Cookie）
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');
    const isAdmin = authToken?.value === 'admin_logged_in';

    const processedCategories = categories.map(category => ({
      ...category,
      sections: category.sections.map((section: any) => {
        // 如果是管理员，返回完整数据
        if (isAdmin) return section;

        // 如果有密码保护
        if (section.password) {
          // 创建一个新的对象，避免修改原始数据
          // 注意：这里我们必须确保不返回 sites 数组，或者返回空数组
          return {
            ...section,
            password: '***', // 隐藏真实密码
            sites: [], // 隐藏站点内容
            isLocked: true // 添加锁定标记
          };
        }

        // 无密码，返回正常数据
        return section;
      })
    }));

    return NextResponse.json(processedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sortOrder } = body;

    const category = await prisma.category.create({
      data: {
        name,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { name, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}