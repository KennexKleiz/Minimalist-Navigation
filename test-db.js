const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database structure...\n');

    // Check if Tool table exists and has data
    const tools = await prisma.tool.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        likes: true,
        views: true,
      }
    });

    console.log('Tools in database:', tools.length);
    if (tools.length > 0) {
      console.log('Sample tools:');
      tools.forEach(tool => {
        console.log(`  - ID: ${tool.id}, Name: ${tool.name}, Likes: ${tool.likes}, Views: ${tool.views}`);
      });
    } else {
      console.log('No tools found in database');
    }

    console.log('\n---\n');

    // Check if ToolLike table exists
    const toolLikes = await prisma.toolLike.findMany({
      take: 5
    });

    console.log('ToolLikes in database:', toolLikes.length);
    if (toolLikes.length > 0) {
      console.log('Sample tool likes:');
      toolLikes.forEach(like => {
        console.log(`  - Tool ID: ${like.toolId}, IP: ${like.ip}`);
      });
    } else {
      console.log('No tool likes found in database');
    }

    console.log('\n---\n');

    // Test raw SQL queries (same as API uses)
    if (tools.length > 0) {
      const testToolId = tools[0].id;
      console.log(`Testing raw SQL queries with Tool ID: ${testToolId}`);

      const result = await prisma.$queryRaw`SELECT likes, views FROM Tool WHERE id = ${testToolId}`;
      console.log('Raw query result:', result);
    }

  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
