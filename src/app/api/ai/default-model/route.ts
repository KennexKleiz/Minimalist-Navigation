import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/default-model
 * 获取全局默认 AI 模型
 */
export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst();

    if (!config || !config.defaultAIModelId) {
      return NextResponse.json({ defaultModelId: null });
    }

    // 获取默认模型的详细信息
    const model = await prisma.aIModel.findUnique({
      where: { id: config.defaultAIModelId },
      include: {
        provider: true,
      },
    });

    return NextResponse.json({
      defaultModelId: config.defaultAIModelId,
      model: model ? {
        id: model.id,
        modelId: model.modelId,
        displayName: model.displayName,
        provider: {
          id: model.provider.id,
          name: model.provider.name,
          type: model.provider.type,
        },
      } : null,
    });
  } catch (error: any) {
    console.error('Failed to get default model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai/default-model
 * 设置全局默认 AI 模型
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // 验证模型是否存在
    const model = await prisma.aIModel.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // 更新配置
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      // 如果配置不存在，创建一个
      config = await prisma.siteConfig.create({
        data: {
          defaultAIModelId: modelId,
        },
      });
    } else {
      // 更新现有配置
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          defaultAIModelId: modelId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      defaultModelId: modelId,
    });
  } catch (error: any) {
    console.error('Failed to set default model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
