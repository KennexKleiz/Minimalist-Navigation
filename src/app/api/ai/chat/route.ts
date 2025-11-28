import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService, getAIServiceById } from '@/lib/ai/service';
import { AIMessage } from '@/lib/ai/providers/base';
import { cookies } from 'next/headers';

/**
 * POST /api/ai/chat
 * 统一的 AI 聊天接口
 *
 * Body:
 * {
 *   messages: AIMessage[],
 *   providerId?: number,  // 可选，指定提供商 ID
 *   modelId?: string,     // 可选，指定模型 ID
 *   temperature?: number,
 *   maxTokens?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, providerId, modelId, temperature, maxTokens } = body;

    // 验证消息格式
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages must be a non-empty array' },
        { status: 400 }
      );
    }

    // 验证消息结构
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { error: 'Each message must have role and content' },
          { status: 400 }
        );
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return NextResponse.json(
          { error: 'Invalid message role. Must be system, user, or assistant' },
          { status: 400 }
        );
      }
    }

    // 获取 AI 服务
    let aiService;
    if (providerId) {
      aiService = await getAIServiceById(providerId, modelId);
    } else {
      aiService = await getDefaultAIService();
    }

    // 调用 AI 服务
    const response = await aiService.chat(messages as AIMessage[], {
      model: modelId,
      temperature,
      maxTokens,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
