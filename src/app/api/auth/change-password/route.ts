import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, oldPassword, newPassword } = body;

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ error: '所有字段都是必填的' }, { status: 400 });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json({ error: '新密码至少需要6个字符' }, { status: 400 });
    }

    // 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 验证旧密码
    const isOldPasswordValid = admin.password.startsWith('$2')
      ? await bcrypt.compare(oldPassword, admin.password)
      : admin.password === oldPassword;

    if (!isOldPasswordValid) {
      return NextResponse.json({ error: '旧密码不正确' }, { status: 401 });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await prisma.admin.update({
      where: { username },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: '密码修改失败' }, { status: 500 });
  }
}
