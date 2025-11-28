import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkToolSecurity, validateToolMetadata } from '@/lib/toolSecurity';

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { category: true }
    });
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证工具元数据
    const metadataValidation = validateToolMetadata(body.name, body.description);
    if (!metadataValidation.isValid) {
      return NextResponse.json({ error: metadataValidation.errors }, { status: 400 });
    }

    // 只有在未跳过安全检查时才进行检查
    let warnings: string[] = [];
    if (!body.skipSecurityCheck) {
      const securityCheck = checkToolSecurity(body.code);
      if (!securityCheck.isSafe) {
        return NextResponse.json({
          error: '代码安全检查失败',
          details: securityCheck.errors
        }, { status: 400 });
      }
      warnings = securityCheck.warnings;
    }

    // 如果未提供 sortOrder，自动计算下一个序号
    let finalSortOrder = body.sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const lastTool = await prisma.tool.findFirst({
        where: { categoryId: body.categoryId },
        orderBy: { sortOrder: 'desc' },
      });
      finalSortOrder = (lastTool?.sortOrder || 0) + 1;
    }

    const tool = await prisma.tool.create({
      data: {
        name: body.name,
        description: body.description,
        code: body.code,
        icon: body.icon,
        categoryId: body.categoryId,
        sortOrder: finalSortOrder,
        skipSecurityCheck: body.skipSecurityCheck || false
      }
    });

    return NextResponse.json({
      tool,
      warnings: warnings.length > 0 ? warnings : undefined
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const tool = await prisma.tool.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        code: body.code,
        icon: body.icon,
        categoryId: body.categoryId,
        sortOrder: body.sortOrder,
        skipSecurityCheck: body.skipSecurityCheck !== undefined ? body.skipSecurityCheck : undefined
      }
    });
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');
    await prisma.tool.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}
