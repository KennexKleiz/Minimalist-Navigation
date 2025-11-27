// 测试工具API功能
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
            body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 开始测试工具API...\n');

  try {
    // 测试获取所有工具
    console.log('1. 测试获取所有工具:');
    const toolsResponse = await makeRequest('/api/tools');
    console.log(`   状态码: ${toolsResponse.statusCode}`);
    if (toolsResponse.statusCode === 200) {
      const tools = JSON.parse(toolsResponse.body);
      console.log(`   ✅ 成功获取 ${tools.length} 个工具`);
      if (tools.length > 0) {
        console.log(`   📋 第一个工具: ${tools[0].name}`);
      }
    } else {
      console.log(`   ❌ 失败: ${toolsResponse.body}`);
    }

    // 测试获取工具分类
    console.log('\n2. 测试获取工具分类:');
    const categoriesResponse = await makeRequest('/api/tools/categories');
    console.log(`   状态码: ${categoriesResponse.statusCode}`);
    if (categoriesResponse.statusCode === 200) {
      const categories = JSON.parse(categoriesResponse.body);
      console.log(`   ✅ 成功获取 ${categories.length} 个分类`);
      if (categories.length > 0) {
        console.log(`   📂 第一个分类: ${categories[0].name}`);
      }
    } else {
      console.log(`   ❌ 失败: ${categoriesResponse.body}`);
    }

    // 测试按分类获取工具
    console.log('\n3. 测试按分类获取工具:');
    const categoryToolsResponse = await makeRequest('/api/tools?category=1');
    console.log(`   状态码: ${categoryToolsResponse.statusCode}`);
    if (categoryToolsResponse.statusCode === 200) {
      const categoryTools = JSON.parse(categoryToolsResponse.body);
      console.log(`   ✅ 成功获取分类1的 ${categoryTools.length} 个工具`);
    } else {
      console.log(`   ❌ 失败: ${categoryToolsResponse.body}`);
    }

    console.log('\n🎉 API测试完成!');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

testAPIs();
