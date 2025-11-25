import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if password is hashed (starts with $2a$ or $2b$) or plain text
    const isPasswordValid = admin.password.startsWith('$2')
      ? await bcrypt.compare(password, admin.password)
      : admin.password === password;

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, we would return a JWT or set a session cookie here.
    // For this simple demo, we'll just return success and handle state on the client
    // or use a simple cookie approach if needed.
    
    const response = NextResponse.json({ success: true, username: admin.username });
    
    // Set a simple cookie for basic protection (not secure for production but fits "simple" requirement)
    response.cookies.set('auth_token', 'admin_logged_in', {
      httpOnly: true,
      // 在本地生产环境测试(npm start)或非HTTPS生产环境时，secure: true 会导致 Cookie 无法设置
      // 这里改为 false 以兼容 HTTP 环境。如果您的生产环境强制 HTTPS，可以改回 true 或使用环境变量控制
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax', // 允许在同站导航时发送 Cookie
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');
    return response;
}