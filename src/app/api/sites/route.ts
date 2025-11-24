import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, sectionId, description, icon, sortOrder } = body;

    if (!title || !url || !sectionId) {
      return NextResponse.json({ error: 'Title, URL, and Section ID are required' }, { status: 400 });
    }

    const site = await prisma.site.create({
      data: {
        title,
        url,
        sectionId: parseInt(sectionId),
        description,
        icon,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { title, url, description, icon, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    const site = await prisma.site.update({
      where: { id: parseInt(id) },
      data: {
        title,
        url,
        description,
        icon,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
      },
    });

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    await prisma.site.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
  }
}