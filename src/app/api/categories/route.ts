import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch categories and sections structure
    const categories = await prisma.category.findMany({
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // 2. Fetch all sites with tags
    const allSites = await prisma.site.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { tags: true }
    });

    // 3. Check admin status
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');
    const isAdmin = authToken?.value === 'admin_logged_in';

    // 4. Merge sites into categories
    const processedCategories = categories.map(category => ({
      ...category,
      sections: category.sections.map((section: any) => {
        // Filter sites for this section
        const sectionSites = allSites.filter((site: any) => site.sectionId === section.id);

        // If admin, return everything
        if (isAdmin) {
          return { ...section, sites: sectionSites };
        }

        // If password protected
        if (section.password) {
          return {
            ...section,
            password: '***',
            sites: [],
            isLocked: true
          };
        }

        // Normal section
        return { ...section, sites: sectionSites };
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

    // 如果未提供 sortOrder，自动计算下一个序号
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const lastCategory = await prisma.category.findFirst({
        orderBy: { sortOrder: 'desc' },
      });
      finalSortOrder = (lastCategory?.sortOrder || 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        name,
        sortOrder: finalSortOrder,
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