import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, categoryId, icon, sortOrder, password } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and Category ID are required' }, { status: 400 });
    }

    // 如果未提供 sortOrder，自动计算下一个序号
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const lastSection = await prisma.section.findFirst({
        where: { categoryId: parseInt(categoryId) },
        orderBy: { sortOrder: 'desc' },
      });
      finalSortOrder = (lastSection?.sortOrder || 0) + 1;
    }

    const section = await prisma.section.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        icon,
        sortOrder: finalSortOrder,
        password: password || null,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { name, icon, sortOrder, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: {
        name,
        icon,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        password: password !== undefined ? password : undefined,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    await prisma.section.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}