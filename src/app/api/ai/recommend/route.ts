import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDefaultAIService } from '@/lib/ai/service';

/**
 * POST /api/ai/recommend
 * AI 推荐接口 - 已迁移到统一 AI 配置系统
 *
 * 支持两种模式：
 * 1. magic_fill - 智能填充网站推荐
 * 2. chat - 对话式推荐
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, type } = body; // type: 'chat' | 'magic_fill'

    // 验证参数
    if (!query || !type) {
      return NextResponse.json(
        { error: 'Query and type are required' },
        { status: 400 }
      );
    }

    // 获取默认 AI 服务
    let aiService;
    try {
      aiService = await getDefaultAIService();
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'AI service not configured',
          message: '请先在 /admin/ai-config 配置 AI 提供商',
          details: error.message,
        },
        { status: 503 }
      );
    }

    if (type === 'magic_fill') {
      // Magic Fill Logic - 智能填充网站推荐
      const prompt = `
        Recommend 3 high-quality, popular websites for the category: "${query}".
        Return ONLY a JSON array with the following structure for each site:
        [
          {
            "title": "Site Name",
            "url": "https://site.url",
            "description": "Brief description in Chinese (max 20 words)",
            "icon": "https://site.url/favicon.ico"
          }
        ]
        Do not include markdown formatting or explanations. Just the JSON array.
      `;

      const response = await aiService.chat([
        { role: 'system', content: '你是一个专业的网站推荐助手，擅长推荐高质量的网站。' },
        { role: 'user', content: prompt },
      ]);

      // Clean up potential markdown code blocks
      const jsonStr = response.content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const sites = JSON.parse(jsonStr);
        return NextResponse.json({ sites });
      } catch (parseError) {
        console.error('Failed to parse AI response:', jsonStr);
        return NextResponse.json(
          {
            error: 'Failed to parse AI response',
            message: 'AI 返回的格式不正确，请重试',
          },
          { status: 500 }
        );
      }
    } else {
      // Chat/Recommendation Logic - 对话式推荐
      // Fetch existing data to give context to AI
      const categories = await prisma.category.findMany({
        include: {
          sections: {
            include: {
              sites: true,
            },
          },
        },
      });

      const context = JSON.stringify(categories, (key, value) => {
        if (
          key === 'id' ||
          key === 'createdAt' ||
          key === 'updatedAt' ||
          key === 'sortOrder' ||
          key === 'categoryId' ||
          key === 'sectionId'
        )
          return undefined;
        return value;
      });

      const prompt = `
        You are a helpful assistant for a navigation website.
        User Query: "${query}"

        Current Website Data (Context):
        ${context}

        Instructions:
        1. If the user asks for a website that exists in the data, recommend it and provide the link.
        2. If the user asks for something not in the data, use your general knowledge to recommend 1-3 high-quality websites.
        3. Keep the answer concise and friendly.
        4. Answer in Chinese.
      `;

      const response = await aiService.chat([
        { role: 'system', content: '你是一个友好的导航网站助手。' },
        { role: 'user', content: prompt },
      ]);

      return NextResponse.json({ reply: response.content });
    }
  } catch (error: any) {
    console.error('AI Recommend Error:', error);
    return NextResponse.json(
      {
        error: 'AI processing failed',
        message: error.message || '处理请求时发生错误',
      },
      { status: 500 }
    );
  }
}