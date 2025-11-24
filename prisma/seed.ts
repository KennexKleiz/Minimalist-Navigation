import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin with hashed password
  // Default credentials: admin / 123456
  const hashedPassword = await bcrypt.hash('123456', 10)

  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
    },
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  // Create default site config
  const config = await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: '极简智能导航',
      subtitle: '探索数字世界的无限可能',
    },
  })

  // Create initial data
  const devCategory = await prisma.category.create({
    data: {
      name: '开发工具',
      sortOrder: 1,
      sections: {
        create: [
          {
            name: '前端框架',
            icon: 'Layout',
            sortOrder: 1,
            sites: {
              create: [
                { title: 'React', url: 'https://react.dev', description: '用于构建 Web 和原生用户界面的库', icon: 'https://react.dev/favicon.ico' },
                { title: 'Next.js', url: 'https://nextjs.org', description: 'React 框架', icon: 'https://nextjs.org/favicon.ico' },
                { title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '只需 HTML 即可快速构建现代网站', icon: 'https://tailwindcss.com/favicon.ico' },
              ]
            }
          },
          {
            name: 'AI 工具',
            icon: 'Bot',
            sortOrder: 2,
            sites: {
              create: [
                { title: 'ChatGPT', url: 'https://chat.openai.com', description: 'OpenAI 开发的 AI 聊天机器人', icon: 'https://chat.openai.com/favicon.ico' },
                { title: 'Gemini', url: 'https://gemini.google.com', description: 'Google 最强大的 AI 模型', icon: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png' },
              ]
            }
          }
        ]
      }
    }
  })

  console.log({ admin, config, devCategory })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })