import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, password } = body;

    if (!sectionId || !password) {
      return NextResponse.json({ error: 'Section ID and password are required' }, { status: 400 });
    }

    // 使用 raw query 获取密码，因为 Prisma Client 可能未更新
    // 使用 SELECT * 确保获取所有字段，防止字段名大小写问题
    const sections: any[] = await prisma.$queryRaw`SELECT * FROM Section WHERE id = ${parseInt(sectionId)}`;

    if (!sections || sections.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const dbPassword = sections[0].password;

    // 确保进行字符串比较，并去除可能的空格
    const cleanDbPass = String(dbPassword).trim();
    const cleanInputPass = String(password).trim();
    
    if (cleanDbPass !== cleanInputPass) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // 密码正确，获取该板块下的站点数据
    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
      include: {
        sites: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return NextResponse.json({ sites: section?.sites || [] });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}