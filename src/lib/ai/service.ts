import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { AIProviderFactory, ProviderType } from './factory';
import { BaseAIProvider, AIMessage, AIResponse, ChatOptions } from './providers/base';

/**
 * AI 服务类
 * 提供统一的 AI 调用接口
 */
export class AIService {
  private provider: BaseAIProvider;
  private modelId?: string;

  constructor(provider: BaseAIProvider, modelId?: string) {
    this.provider = provider;
    this.modelId = modelId;
  }

  /**
   * 发送聊天消息
   */
  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    const chatOptions = {
      ...options,
      model: options?.model || this.modelId,
    };
    return this.provider.chat(messages, chatOptions);
  }

  /**
   * 获取提供商实例
   */
  getProvider(): BaseAIProvider {
    return this.provider;
  }
}

/**
 * 从数据库获取默认的 AI 服务
 */
export async function getDefaultAIService(): Promise<AIService> {
  // 查找默认的提供商
  const defaultProvider = await prisma.aIProvider.findFirst({
    where: {
      enabled: true,
      isDefault: true,
    },
    include: {
      models: {
        where: {
          enabled: true,
          isDefault: true,
        },
      },
    },
  });

  if (!defaultProvider) {
    throw new Error('No default AI provider configured');
  }

  // 解密 API Key
  const apiKey = decrypt(defaultProvider.apiKey);

  // 解析额外配置
  const config = defaultProvider.config ? JSON.parse(defaultProvider.config) : {};

  // 创建提供商实例
  const provider = AIProviderFactory.createProvider(defaultProvider.type as ProviderType, {
    apiKey,
    baseUrl: defaultProvider.baseUrl || undefined,
    ...config,
  });

  // 获取默认模型
  const defaultModel = defaultProvider.models[0];

  return new AIService(provider, defaultModel?.modelId);
}

/**
 * 从数据库获取指定的 AI 服务
 */
export async function getAIServiceById(providerId: number, modelId?: string): Promise<AIService> {
  const provider = await prisma.aIProvider.findUnique({
    where: { id: providerId },
    include: {
      models: true,
    },
  });

  if (!provider) {
    throw new Error(`AI provider with id ${providerId} not found`);
  }

  if (!provider.enabled) {
    throw new Error(`AI provider ${provider.name} is disabled`);
  }

  // 解密 API Key
  const apiKey = decrypt(provider.apiKey);

  // 解析额外配置
  const config = provider.config ? JSON.parse(provider.config) : {};

  // 创建提供商实例
  const providerInstance = AIProviderFactory.createProvider(provider.type as ProviderType, {
    apiKey,
    baseUrl: provider.baseUrl || undefined,
    ...config,
  });

  // 如果指定了模型 ID，验证该模型是否存在且启用
  if (modelId) {
    const model = provider.models.find((m) => m.modelId === modelId && m.enabled);
    if (!model) {
      throw new Error(`Model ${modelId} not found or disabled`);
    }
  }

  return new AIService(providerInstance, modelId);
}

/**
 * 获取所有可用的 AI 提供商
 */
export async function getAvailableProviders() {
  return prisma.aIProvider.findMany({
    where: { enabled: true },
    include: {
      models: {
        where: { enabled: true },
      },
    },
  });
}

/**
 * 测试 AI 提供商连接
 */
export async function testProviderConnection(
  type: ProviderType,
  apiKey: string,
  baseUrl?: string
): Promise<boolean> {
  try {
    const provider = AIProviderFactory.createProvider(type, {
      apiKey,
      baseUrl,
    });
    return await provider.testConnection();
  } catch (error) {
    console.error('Provider connection test failed:', error);
    return false;
  }
}
