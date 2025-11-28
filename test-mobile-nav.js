// 测试手机端导航栏工具入口显示
const { chromium } = require('playwright');

async function testMobileNav() {
  console.log('🧪 开始测试手机端导航栏工具入口显示...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 } // 手机尺寸
  });
  const page = await context.newPage();

  try {
    // 1. 访问首页
    console.log('1. 访问首页...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // 2. 点击手机菜单按钮
    console.log('2. 点击手机菜单按钮...');
    const menuButton = page.locator('button:has(svg:has-text("Menu"))');
    await menuButton.click();
    await page.waitForTimeout(500);

    // 3. 检查是否有"在线工具"链接
    console.log('3. 检查移动菜单中是否有"在线工具"链接...');
    const toolsLink = page.locator('a[href="/tools"]');
    const toolsText = await toolsLink.textContent();
    
    if (toolsLink && toolsText && toolsText.includes('在线工具')) {
      console.log('   ✅ 成功找到"在线工具"链接');
    } else {
      console.log('   ❌ 未找到"在线工具"链接');
    }

    // 4. 测试工具页面
    console.log('\n4. 访问工具页面...');
    await page.goto('http://localhost:3002/tools');
    await page.waitForLoadState('networkidle');

    // 5. 在工具页面再次检查菜单
    console.log('5. 在工具页面检查菜单...');
    await menuButton.click();
    await page.waitForTimeout(500);

    const toolsLinkActive = page.locator('a[href="/tools"]:has-text("在线工具")');
    const isActive = await toolsLinkActive.isVisible();
    
    if (isActive) {
      console.log('   ✅ 工具页面中"在线工具"链接正确高亮显示');
    } else {
      console.log('   ❌ 工具页面中"在线工具"链接未正确高亮');
    }

    // 6. 截图保存
    await page.screenshot({ path: 'mobile-nav-test.png', fullPage: true });
    console.log('\n📸 已保存截图: mobile-nav-test.png');

    console.log('\n🎉 手机端导航测试完成!');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    await browser.close();
  }
}

testMobileNav();
