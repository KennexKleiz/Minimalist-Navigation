const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfig() {
  console.log('Checking SiteConfig table...\n');

  const config = await prisma.siteConfig.findFirst();

  if (config) {
    console.log('Current config:');
    console.log('  - showTools:', config.showTools);
    console.log('  - showToolRankings:', config.showToolRankings);

    // 如果 showToolRankings 不存在，更新它
    if (config.showToolRankings === undefined || config.showToolRankings === null) {
      console.log('\nUpdating config to add showToolRankings...');
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: { showToolRankings: true }
      });
      console.log('✓ Updated successfully!');
    } else {
      console.log('\n✓ showToolRankings field already exists!');
    }
  } else {
    console.log('No config found, creating default config...');
    await prisma.siteConfig.create({
      data: {
        title: '极简智能导航',
        subtitle: '探索数字世界的无限可能',
        showToolRankings: true
      }
    });
    console.log('✓ Config created!');
  }

  await prisma.$disconnect();
}

checkConfig();
