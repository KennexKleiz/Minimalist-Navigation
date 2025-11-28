import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { AIProviderFactory, ProviderType } from '@/lib/ai/factory';
import { cookies } from 'next/headers';

/**
 * GET /api/ai-providers/[id]/models
 * 从 AI 提供商获取可用模型列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);

    // 获取提供商信息
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // 解密 API Key
    const apiKey = decrypt(provider.apiKey);

    // 解析配置
    const config = provider.config ? JSON.parse(provider.config) : {};

    // 创建提供商实例
    const providerInstance = AIProviderFactory.createProvider(provider.type as ProviderType, {
      apiKey,
      baseUrl: provider.baseUrl || undefined,
      ...config,
    });

    // 获取模型列表
    const models = await providerInstance.listModels();

    return NextResponse.json(models);
  } catch (error: any) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai-providers/[id]/models
 * 保存选中的模型到数据库
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);
    const body = await request.json();
    const { models } = body;

    if (!Array.isArray(models)) {
      return NextResponse.json({ error: 'Models must be an array' }, { status: 400 });
    }

    // 验证提供商是否存在
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // 删除该提供商的所有现有模型
    await prisma.aIModel.deleteMany({
      where: { providerId },
    });

    // 创建新模型
    const createdModels = await Promise.all(
      models.map((model: any, index: number) =>
        prisma.aIModel.create({
          data: {
            providerId,
            modelId: model.id,
            displayName: model.name || model.id,
            enabled: model.enabled !== undefined ? model.enabled : true,
            isDefault: index === 0 && model.isDefault !== false, // 第一个默认为默认模型
            capabilities: model.capabilities ? JSON.stringify(model.capabilities) : null,
          },
        })
      )
    );

    return NextResponse.json(createdModels);
  } catch (error: any) {
    console.error('Failed to save models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
