import {
  BaseAIProvider,
  AIMessage,
  AIResponse,
  AIModelInfo,
  ChatOptions,
  ProviderConfig,
} from './base';

/**
 * 智谱 AI 提供商适配器
 */
export class ZhipuProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://open.bigmodel.cn/api/paas/v4';
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'glm-4',
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: options?.temperature,
          max_tokens: options?.maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice || !choice.message) {
        throw new Error('No response from Zhipu AI');
      }

      return {
        content: choice.message.content || '',
        model: data.model,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`Zhipu AI API error: ${error.message}`);
    }
  }

  async listModels(): Promise<AIModelInfo[]> {
    // 智谱 AI 的已知模型列表
    return [
      {
        id: 'glm-4',
        name: 'GLM-4',
        description: '智谱 AI 最新一代基座大模型',
      },
      {
        id: 'glm-4v',
        name: 'GLM-4V',
        description: '智谱 AI 多模态大模型',
      },
      {
        id: 'glm-3-turbo',
        name: 'GLM-3-Turbo',
        description: '智谱 AI 快速响应模型',
      },
    ];
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getProviderName(): string {
    return '智谱AI';
  }
}
