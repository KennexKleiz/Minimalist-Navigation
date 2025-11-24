import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

// Initialize Gemini API
// Note: In a real app, this key should be in .env
// For this demo, we'll assume it's provided or use a placeholder if missing
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, type } = body; // type: 'chat' | 'magic_fill'

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY in .env' 
      }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    if (type === 'magic_fill') {
      // Magic Fill Logic
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

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Clean up potential markdown code blocks
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const sites = JSON.parse(jsonStr);

      return NextResponse.json({ sites });
    } else {
      // Chat/Recommendation Logic
      // Fetch existing data to give context to AI
      const categories = await prisma.category.findMany({
        include: {
          sections: {
            include: {
              sites: true
            }
          }
        }
      });

      const context = JSON.stringify(categories, (key, value) => {
        if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'sortOrder' || key === 'categoryId' || key === 'sectionId') return undefined;
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

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return NextResponse.json({ reply: text });
    }

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}