import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 16
    const { id } = await params;
    const toolId = parseInt(id);

    if (isNaN(toolId)) {
      return NextResponse.json(
        { error: 'Invalid tool ID' },
        { status: 400 }
      );
    }

    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}
