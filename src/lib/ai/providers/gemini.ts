import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  BaseAIProvider,
  AIMessage,
  AIResponse,
  AIModelInfo,
  ChatOptions,
  ProviderConfig,
} from './base';

/**
 * Gemini 提供商适配器
 */
export class GeminiProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    try {
      const modelName = options?.model || 'gemini-pro';
      const model = this.client.getGenerativeModel({ model: modelName });

      // 将消息转换为 Gemini 格式
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options?.temperature,
          maxOutputTokens: options?.maxTokens,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      return {
        content: text,
        model: modelName,
        usage: {
          promptTokens: 0, // Gemini 不提供详细的 token 统计
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async listModels(): Promise<AIModelInfo[]> {
    try {
      const models = await this.client.listModels();
      return models
        .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name,
          description: model.description || `Google ${model.displayName}`,
        }));
    } catch (error: any) {
      // 如果 API 不支持列出模型，返回默认列表
      return [
        { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google Gemini Pro' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Google Gemini Pro Vision' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Google Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Google Gemini 1.5 Flash' },
      ];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('test');
      return !!result.response;
    } catch (error) {
      return false;
    }
  }

  getProviderName(): string {
    return 'Gemini';
  }
}
