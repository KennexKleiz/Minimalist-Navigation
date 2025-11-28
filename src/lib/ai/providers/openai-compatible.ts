import OpenAI from 'openai';
import {
  BaseAIProvider,
  AIMessage,
  AIResponse,
  AIModelInfo,
  ChatOptions,
  ProviderConfig,
} from './base';

/**
 * OpenAI 兼容格式提供商适配器
 * 用于 New API、One API 等中转服务
 */
export class OpenAICompatibleProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);

    if (!this.baseUrl) {
      throw new Error('baseUrl is required for OpenAI-compatible provider');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-3.5-turbo',
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from API');
      }

      return {
        content: choice.message.content || '',
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`OpenAI-compatible API error: ${error.message}`);
    }
  }

  async listModels(): Promise<AIModelInfo[]> {
    try {
      const response = await this.client.models.list();
      return response.data.map((model) => ({
        id: model.id,
        name: model.id,
        description: `Model: ${model.id}`,
      }));
    } catch (error: any) {
      // 如果无法获取模型列表，返回空数组
      console.warn('Failed to list models from OpenAI-compatible API:', error.message);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // 尝试列出模型来测试连接
      await this.client.models.list();
      return true;
    } catch (error) {
      // 如果列出模型失败，尝试发送一个简单的聊天请求
      try {
        await this.client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        });
        return true;
      } catch (chatError) {
        return false;
      }
    }
  }

  getProviderName(): string {
    return 'OpenAI Compatible';
  }
}
