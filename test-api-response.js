const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIResponse() {
  try {
    console.log('Testing /api/tools/categories response...\n');

    const categories = await prisma.toolCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        tools: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log('Number of categories:', categories.length);

    if (categories.length > 0) {
      console.log('\nFirst category:', categories[0].name);
      console.log('Number of tools in first category:', categories[0].tools.length);

      if (categories[0].tools.length > 0) {
        console.log('\nFirst 3 tools with their stats:');
        categories[0].tools.slice(0, 3).forEach(tool => {
          console.log(`  - ID: ${tool.id}, Name: ${tool.name}`);
          console.log(`    likes: ${tool.likes} (type: ${typeof tool.likes})`);
          console.log(`    views: ${tool.views} (type: ${typeof tool.views})`);
        });
      }
    }

    // Test what the frontend receives
    console.log('\n--- Simulating frontend data ---');
    categories.forEach(category => {
      category.tools.forEach(tool => {
        const initialLikes = tool.likes;
        const initialViews = tool.views;
        console.log(`Tool: ${tool.name}`);
        console.log(`  Received likes: ${initialLikes}, views: ${initialViews}`);
        console.log(`  After || 0: likes=${initialLikes || 0}, views=${initialViews || 0}`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIResponse();
