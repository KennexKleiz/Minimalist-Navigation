const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAutoSort() {
  console.log('Testing auto-sort for tools...\n');

  // 获取第一个分类
  const category = await prisma.toolCategory.findFirst();

  if (!category) {
    console.log('No tool category found');
    await prisma.$disconnect();
    return;
  }

  console.log('Category:', category.name, '(ID:', category.id, ')');

  // 查找该分类下最后一个工具的 sortOrder
  const lastTool = await prisma.tool.findFirst({
    where: { categoryId: category.id },
    orderBy: { sortOrder: 'desc' },
  });

  console.log('Last tool sortOrder:', lastTool?.sortOrder || 0);
  console.log('Next sortOrder should be:', (lastTool?.sortOrder || 0) + 1);

  // 查看该分类下所有工具的 sortOrder
  const tools = await prisma.tool.findMany({
    where: { categoryId: category.id },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, sortOrder: true }
  });

  console.log('\nCurrent tools in category:');
  tools.forEach(tool => {
    console.log(`  - ${tool.name}: sortOrder = ${tool.sortOrder}`);
  });

  await prisma.$disconnect();
}

testAutoSort();
