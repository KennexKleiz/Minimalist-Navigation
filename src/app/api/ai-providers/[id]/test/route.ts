import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { AIProviderFactory, ProviderType } from '@/lib/ai/factory';
import { cookies } from 'next/headers';

/**
 * POST /api/ai-providers/[id]/test
 * 测试 AI 提供商连接
 */
export async function POST(
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

    // 测试连接
    const isConnected = await providerInstance.testConnection();

    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed',
    });
  } catch (error: any) {
    console.error('Connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
