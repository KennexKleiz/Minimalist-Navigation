import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 检查是否已有工具数据
  const existingToolsCount = await prisma.tool.count();
  const existingCategoriesCount = await prisma.toolCategory.count();

  if (existingToolsCount > 0 || existingCategoriesCount > 0) {
    console.log('⚠️  检测到现有数据:');
    console.log(`   - 工具分类: ${existingCategoriesCount} 个`);
    console.log(`   - 工具: ${existingToolsCount} 个`);
    console.log('');
    console.log('为了保护现有数据，种子脚本已跳过。');
    console.log('');
    console.log('如果你想重置所有工具数据，请手动删除后再运行：');
    console.log('  1. 进入管理后台删除所有工具');
    console.log('  2. 或者在 seed.ts 中取消注释删除代码');
    console.log('');
    return;
  }

  console.log('✓ 数据库为空，开始导入内置工具...');

  // 如果需要强制重置，取消下面两行的注释：
  // await prisma.tool.deleteMany();
  // await prisma.toolCategory.deleteMany();

  // 2. 创建工具分类
  const textCategory = await prisma.toolCategory.create({
    data: {
      name: '文字处理',
      sortOrder: 1,
    },
  });

  const devCategory = await prisma.toolCategory.create({
    data: {
      name: '开发工具',
      sortOrder: 2,
    },
  });

  const convertCategory = await prisma.toolCategory.create({
    data: {
      name: '格式转换',
      sortOrder: 3,
    },
  });

  const utilityCategory = await prisma.toolCategory.create({
    data: {
      name: '实用工具',
      sortOrder: 4,
    },
  });

  // 2. 创建工具
  const textTools = [
    {
      name: '文本去重',
      description: '在线去除文本中的重复行，支持按行去重',
      icon: '📝',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>文本去重工具</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 20px; background-color: #f4f4f5; color: #18181b; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  textarea { width: 100%; height: 200px; margin-bottom: 10px; padding: 10px; border: 1px solid #e4e4e7; border-radius: 4px; font-family: monospace; resize: vertical; }
  button { background-color: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.2s; }
  button:hover { background-color: #4f46e5; }
  .result-area { margin-top: 20px; }
  h2 { font-size: 18px; margin-bottom: 10px; }
  .stats { font-size: 12px; color: #71717a; margin-top: 5px; }
  @media (prefers-color-scheme: dark) {
    body { background-color: #18181b; color: #fafafa; }
    .container { background-color: #27272a; }
    textarea { background-color: #3f3f46; border-color: #52525b; color: #fafafa; }
  }
</style>
</head>
<body>
<div class="container">
  <h2>输入文本</h2>
  <textarea id="input" placeholder="请输入需要去重的文本，每行一条..."></textarea>
  <button onclick="removeDuplicates()">执行去重</button>
  
  <div class="result-area">
    <h2>去重结果</h2>
    <textarea id="output" readonly></textarea>
    <div class="stats" id="stats"></div>
  </div>
</div>
<script>
function removeDuplicates() {
  const input = document.getElementById('input').value;
  const lines = input.split('\\n');
  const uniqueLines = [...new Set(lines)].filter(line => line.trim() !== '');
  
  document.getElementById('output').value = uniqueLines.join('\\n');
  document.getElementById('stats').innerText = \`原文本行数: \${lines.length} | 去重后行数: \${uniqueLines.length} | 移除重复: \${lines.length - uniqueLines.length}\`;
}
</script>
</body>
</html>`,
    },
    {
      name: '汉字转拼音',
      description: '在线将汉字转换为拼音，支持声调显示',
      icon: '🔤',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>汉字转拼音</title>
<script src="https://cdn.jsdelivr.net/npm/pinyin-pro@3.13.2/dist/index.min.js"></script>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 20px; background-color: #f4f4f5; color: #18181b; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  textarea { width: 100%; height: 150px; margin-bottom: 10px; padding: 10px; border: 1px solid #e4e4e7; border-radius: 4px; resize: vertical; }
  .controls { margin-bottom: 15px; display: flex; gap: 10px; align-items: center; }
  button { background-color: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
  button:hover { background-color: #4f46e5; }
  select { padding: 8px; border-radius: 4px; border: 1px solid #e4e4e7; }
  #output { font-size: 18px; line-height: 1.6; padding: 15px; background: #f8fafc; border-radius: 4px; min-height: 100px; white-space: pre-wrap; }
  @media (prefers-color-scheme: dark) {
    body { background-color: #18181b; color: #fafafa; }
    .container { background-color: #27272a; }
    textarea, select { background-color: #3f3f46; border-color: #52525b; color: #fafafa; }
    #output { background-color: #3f3f46; }
  }
</style>
</head>
<body>
<div class="container">
  <textarea id="input" placeholder="请输入汉字...">你好世界</textarea>
  <div class="controls">
    <select id="toneType">
      <option value="symbol">带声调</option>
      <option value="none">无声调</option>
      <option value="num">数字声调</option>
    </select>
    <button onclick="convert()">转换</button>
  </div>
  <div id="output"></div>
</div>
<script>
const { pinyin } = pinyinPro;
function convert() {
  const text = document.getElementById('input').value;
  const toneType = document.getElementById('toneType').value;
  const result = pinyin(text, { toneType: toneType });
  document.getElementById('output').innerText = result;
}
</script>
</body>
</html>`,
    },
    {
      name: '文本对比工具',
      description: '在线比较两段文本的差异，高亮显示不同之处',
      icon: '⚖️',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>文本对比</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js"></script>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { display: flex; gap: 20px; max-width: 1200px; margin: 0 auto; }
  .box { flex: 1; display: flex; flex-direction: column; }
  textarea { height: 300px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; resize: vertical; }
  .result { margin-top: 20px; background: white; padding: 20px; border-radius: 8px; line-height: 1.6; white-space: pre-wrap; }
  ins { background: #e6ffec; text-decoration: none; color: #166534; }
  del { background: #ffebe9; color: #991b1b; }
  button { display: block; margin: 20px auto; padding: 10px 30px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #fff; }
    .result { background: #27272a; }
    textarea { background: #3f3f46; color: #fff; border-color: #52525b; }
    ins { background: #064e3b; color: #86efac; }
    del { background: #7f1d1d; color: #fca5a5; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="box">
    <h3>原文</h3>
    <textarea id="text1"></textarea>
  </div>
  <div class="box">
    <h3>新文</h3>
    <textarea id="text2"></textarea>
  </div>
</div>
<button onclick="compare()">开始对比</button>
<div class="result" id="result"></div>
<script>
function compare() {
  const dmp = new diff_match_patch();
  const text1 = document.getElementById('text1').value;
  const text2 = document.getElementById('text2').value;
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);
  const html = dmp.diff_prettyHtml(diffs);
  document.getElementById('result').innerHTML = html;
}
</script>
</body>
</html>`,
    }
  ];

  const devTools = [
    {
      name: 'JSON格式化工具',
      description: '在线格式化和验证JSON数据，支持压缩和美化',
      icon: '🔧',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JSON格式化工具</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  textarea { width: 100%; height: 400px; padding: 10px; border: 1px solid #e4e4e7; border-radius: 4px; font-family: monospace; resize: vertical; }
  .controls { margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap; }
  button { background-color: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
  button:hover { background-color: #4f46e5; }
  .error { color: #dc2626; font-size: 12px; margin-top: 5px; }
  h3 { margin-bottom: 10px; }
  @media (prefers-color-scheme: dark) {
    body { background-color: #18181b; color: #fafafa; }
    .container { background-color: #27272a; }
    textarea { background-color: #3f3f46; border-color: #52525b; color: #fafafa; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="controls">
    <button onclick="formatJSON()">格式化</button>
    <button onclick="compressJSON()">压缩</button>
    <button onclick="clearAll()">清空</button>
  </div>
  <div class="grid">
    <div>
      <h3>输入 JSON</h3>
      <textarea id="input" placeholder='{"name": "张三", "age": 25}'></textarea>
      <div class="error" id="error"></div>
    </div>
    <div>
      <h3>格式化结果</h3>
      <textarea id="output" readonly></textarea>
    </div>
  </div>
</div>
<script>
function formatJSON() {
  const input = document.getElementById('input').value;
  const errorEl = document.getElementById('error');
  const outputEl = document.getElementById('output');
  
  try {
    const json = JSON.parse(input);
    outputEl.value = JSON.stringify(json, null, 2);
    errorEl.textContent = '';
  } catch (e) {
    errorEl.textContent = 'JSON 格式错误: ' + e.message;
    outputEl.value = '';
  }
}

function compressJSON() {
  const input = document.getElementById('input').value;
  const errorEl = document.getElementById('error');
  const outputEl = document.getElementById('output');
  
  try {
    const json = JSON.parse(input);
    outputEl.value = JSON.stringify(json);
    errorEl.textContent = '';
  } catch (e) {
    errorEl.textContent = 'JSON 格式错误: ' + e.message;
    outputEl.value = '';
  }
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
  document.getElementById('error').textContent = '';
}
</script>
</body>
</html>`,
    },
    {
      name: 'Base64编码/解码',
      description: '在线进行Base64编码和解码操作',
      icon: '🔐',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Base64编码/解码</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  textarea { width: 100%; height: 200px; margin-bottom: 15px; padding: 10px; border: 1px solid #e4e4e7; border-radius: 4px; resize: vertical; }
  .controls { margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap; }
  button { background-color: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
  button:hover { background-color: #4f46e5; }
  h3 { margin-bottom: 10px; }
  @media (prefers-color-scheme: dark) {
    body { background-color: #18181b; color: #fafafa; }
    .container { background-color: #27272a; }
    textarea { background-color: #3f3f46; border-color: #52525b; color: #fafafa; }
  }
</style>
</head>
<body>
<div class="container">
  <h3>原文</h3>
  <textarea id="input" placeholder="输入要编码或解码的文本..."></textarea>
  
  <div class="controls">
    <button onclick="encode()">编码 → Base64</button>
    <button onclick="decode()">解码 ← Base64</button>
    <button onclick="swap()">交换输入输出</button>
    <button onclick="clearAll()">清空</button>
  </div>
  
  <h3>结果</h3>
  <textarea id="output" readonly placeholder="结果将显示在这里..."></textarea>
</div>
<script>
function encode() {
  const input = document.getElementById('input').value;
  try {
    const encoded = btoa(unescape(encodeURIComponent(input)));
    document.getElementById('output').value = encoded;
  } catch (e) {
    document.getElementById('output').value = '编码失败: ' + e.message;
  }
}

function decode() {
  const input = document.getElementById('input').value;
  try {
    const decoded = decodeURIComponent(escape(atob(input)));
    document.getElementById('output').value = decoded;
  } catch (e) {
    document.getElementById('output').value = '解码失败: ' + e.message;
  }
}

function swap() {
  const input = document.getElementById('input').value;
  const output = document.getElementById('output').value;
  document.getElementById('input').value = output;
  document.getElementById('output').value = input;
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
}
</script>
</body>
</html>`,
    },
    {
      name: '正则表达式测试',
      description: '在线测试和调试正则表达式',
      icon: '🔍',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>正则表达式测试</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .form-group { margin-bottom: 15px; }
  label { display: block; margin-bottom: 5px; font-weight: 500; }
  input, textarea { width: 100%; padding: 10px; border: 1px solid #e4e4e7; border-radius: 4px; font-family: monospace; }
  textarea { height: 150px; resize: vertical; }
  button { background-color: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
  button:hover { background-color: #4f46e5; }
  .results { margin-top: 20px; }
  .match { background: #fef3c7; padding: 2px 4px; border-radius: 2px; }
  .match-list { max-height: 200px; overflow-y: auto; border: 1px solid #e4e4e7; border-radius: 4px; padding: 10px; }
  .match-item { padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
  .match-item:last-child { border-bottom: none; }
  @media (prefers-color-scheme: dark) {
    body { background-color: #18181b; color: #fafafa; }
    .container { background-color: #27272a; }
    input, textarea { background-color: #3f3f46; border-color: #52525b; color: #fafafa; }
    .match { background: #92400e; }
    .match-list { border-color: #52525b; }
    .match-item { border-color: #3f3f46; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="form-group">
    <label for="regex">正则表达式:</label>
    <input type="text" id="regex" placeholder="例如: \\d+" value="\\d+">
  </div>
  
  <div class="form-group">
    <label for="flags">标志:</label>
    <div>
      <label><input type="checkbox" id="global" checked> g (全局匹配)</label>
      <label><input type="checkbox" id="ignoreCase"> i (忽略大小写)</label>
      <label><input type="checkbox" id="multiline"> m (多行模式)</label>
    </div>
  </div>
  
  <div class="form-group">
    <label for="text">测试文本:</label>
    <textarea id="text" placeholder="输入要测试的文本...">Hello 123 World 456 Test 789</textarea>
  </div>
  
  <button onclick="testRegex()">测试</button>
  <button onclick="clearAll()">清空</button>
  
  <div class="results">
    <h3>匹配结果:</h3>
    <div id="highlightedText"></div>
    <div class="match-list" id="matchList"></div>
  </div>
</div>
<script>
function testRegex() {
  const regexText = document.getElementById('regex').value;
  const text = document.getElementById('text').value;
  const globalFlag = document.getElementById('global').checked;
  const ignoreCaseFlag = document.getElementById('ignoreCase').checked;
  const multilineFlag = document.getElementById('multiline').checked;
  
  let flags = '';
  if (globalFlag) flags += 'g';
  if (ignoreCaseFlag) flags += 'i';
  if (multilineFlag) flags += 'm';
  
  try {
    const regex = new RegExp(regexText, flags);
    const matches = text.match(regex);
    
    // 高亮显示匹配结果
    let highlightedText = text;
    if (matches) {
      const matchIndices = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        matchIndices.push({
          start: match.index,
          end: match.index + match[0].length,
          value: match[0]
        });
        if (!globalFlag) break;
      }
      
      // 从后往前替换，避免位置偏移
      matchIndices.reverse().forEach(item => {
        highlightedText = highlightedText.slice(0, item.start) + 
          '<span class="match">' + highlightedText.slice(item.start, item.end) + '</span>' + 
          highlightedText.slice(item.end);
      });
    }
    
    document.getElementById('highlightedText').innerHTML = highlightedText;
    
    // 显示匹配列表
    const matchList = document.getElementById('matchList');
    if (matches) {
      matchList.innerHTML = matches.map((match, index) => 
        '<div class="match-item">匹配 ' + (index + 1) + ': ' + match + '</div>'
      ).join('');
    } else {
      matchList.innerHTML = '<div class="match-item">没有匹配结果</div>';
    }
  } catch (e) {
    document.getElementById('highlightedText').innerHTML = '<div style="color: red;">正则表达式错误: ' + e.message + '</div>';
    document.getElementById('matchList').innerHTML = '';
  }
}

function clearAll() {
  document.getElementById('regex').value = '';
  document.getElementById('text').value = '';
  document.getElementById('highlightedText').innerHTML = '';
  document.getElementById('matchList').innerHTML = '';
}

// 初始化时执行一次测试
testRegex();
</script>
</body>
</html>`,
    }
  ];

  const convertTools = [
    {
      name: '英文大小写转换',
      description: '在线进行英文大小写转换，支持全大写、全小写、首字母大写等',
      icon: '🔠',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; color: #333; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; }
  .btn-group { display: flex; gap: 10px; flex-wrap: wrap; }
  button { padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background: #4f46e5; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #eee; }
    .container { background: #27272a; }
    textarea { background: #3f3f46; color: #eee; border-color: #52525b; }
  }
</style>
</head>
<body>
<div class="container">
  <textarea id="text" placeholder="Type or paste your text here..."></textarea>
  <div class="btn-group">
    <button onclick="transform('upper')">全大写 (UPPERCASE)</button>
    <button onclick="transform('lower')">全小写 (lowercase)</button>
    <button onclick="transform('capitalize')">首字母大写 (Capitalize)</button>
    <button onclick="transform('sentence')">句首大写 (Sentence case)</button>
    <button onclick="transform('alternating')">交替大小写 (aLtErNaTiNg)</button>
  </div>
</div>
<script>
function transform(type) {
  const el = document.getElementById('text');
  let text = el.value;
  
  switch(type) {
    case 'upper': text = text.toUpperCase(); break;
    case 'lower': text = text.toLowerCase(); break;
    case 'capitalize': 
      text = text.replace(/\\b\\w/g, c => c.toUpperCase());
      break;
    case 'sentence':
      text = text.toLowerCase().replace(/(^\\s*\\w|[.!?]\\s*\\w)/g, c => c.toUpperCase());
      break;
    case 'alternating':
      text = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      break;
  }
  el.value = text;
}
</script>
</body>
</html>`,
    },
    {
      name: 'URL提取器',
      description: '从文本中批量提取所有网址链接',
      icon: '🔗',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }
  button { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; }
  #result { margin-top: 20px; white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 4px; min-height: 50px; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #eee; }
    .container { background: #27272a; }
    textarea { background: #3f3f46; color: #eee; border-color: #52525b; }
    #result { background: #3f3f46; }
  }
</style>
</head>
<body>
<div class="container">
  <h3>输入包含网址的文本</h3>
  <textarea id="input"></textarea>
  <button onclick="extract()">提取 URL</button>
  <h3>提取结果</h3>
  <textarea id="result" readonly></textarea>
</div>
<script>
function extract() {
  const text = document.getElementById('input').value;
  const regex = /(https?:\\/\\/[^\\s]+)/g;
  const matches = text.match(regex);
  document.getElementById('result').value = matches ? matches.join('\\n') : '未找到 URL';
}
</script>
</body>
</html>`,
    },
    {
      name: '时间戳转换',
      description: 'Unix时间戳与日期时间格式互转',
      icon: '⏰',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  .form-group { margin-bottom: 20px; }
  label { display: block; margin-bottom: 5px; font-weight: 500; }
  input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
  button { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
  button:hover { background: #4f46e5; }
  .result { background: #f8fafc; padding: 15px; border-radius: 4px; margin-top: 10px; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #eee; }
    .container { background: #27272a; }
    input { background: #3f3f46; color: #eee; border-color: #52525b; }
    .result { background: #3f3f46; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="form-group">
    <label>时间戳:</label>
    <input type="text" id="timestamp" placeholder="输入时间戳，如: 1700000000">
    <button onclick="timestampToDate()">转换为日期</button>
    <div class="result" id="dateResult"></div>
  </div>
  
  <div class="form-group">
    <label>日期时间:</label>
    <input type="datetime-local" id="datetime">
    <button onclick="dateToTimestamp()">转换为时间戳</button>
    <div class="result" id="timestampResult"></div>
  </div>
</div>
<script>
function timestampToDate() {
  const timestamp = document.getElementById('timestamp').value;
  if (!timestamp) return;
  
  const date = new Date(parseInt(timestamp) * 1000);
  document.getElementById('dateResult').innerHTML = 
    '日期: ' + date.toLocaleString('zh-CN') + '<br>' +
    'ISO: ' + date.toISOString() + '<br>' +
    'UTC: ' + date.toUTCString();
}

function dateToTimestamp() {
  const datetime = document.getElementById('datetime').value;
  if (!datetime) return;
  
  const date = new Date(datetime);
  const timestamp = Math.floor(date.getTime() / 1000);
  document.getElementById('timestampResult').innerHTML = 
    '时间戳: ' + timestamp + '<br>' +
    '毫秒时间戳: ' + date.getTime() + '<br>' +
    '当前时间: ' + date.toLocaleString('zh-CN');
}

// 设置默认值为当前时间
document.getElementById('datetime').value = new Date().toISOString().slice(0, 16);
</script>
</body>
</html>`,
    }
  ];

  const utilityTools = [
    {
      name: '特殊符号表情大全',
      description: '常用特殊符号、颜文字、Emoji表情复制',
      icon: '😊',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  .section { margin-bottom: 30px; }
  h3 { border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); gap: 10px; }
  .item { 
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; 
    padding: 10px; text-align: center; cursor: pointer; transition: all 0.2s;
    font-size: 20px;
  }
  .item:hover { background: #e0e7ff; border-color: #6366f1; transform: scale(1.1); }
  .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 20px; display: none; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #eee; }
    .container { background: #27272a; }
    .item { background: #3f3f46; border-color: #52525b; }
    .item:hover { background: #4f46e5; }
    h3 { border-color: #3f3f46; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="section">
    <h3>常用符号</h3>
    <div class="grid" id="symbols"></div>
  </div>
  <div class="section">
    <h3>Emoji 表情</h3>
    <div class="grid" id="emojis"></div>
  </div>
</div>
<div class="toast" id="toast">已复制!</div>
<script>
const symbols = ['★','☆','✦','✧','▲','△','▼','▽','◆','◇','○','◎','●','℃','‰','℉','℗','®','©','™','✓','✔','✕','✖','✗','✘','❤','♡','♥','❥','웃','유','♋','☮','✌','☏','☢','☠','✔','☑','♚','▲','♪','✈','✞','÷','↑','↓','◆','◇','⊙','■','□','△','▽','¿','─','│','♥','❣','♂','♀','☿','Ⓐ','✍','✉','☣','☤','✘','☒','♛','▼','♫','⌘','☪','≈','←','→','◈','◎','☉','★','☆','⊿','※','¡','━','┃','♡','ღ','ツ','☼','☁','❅','♒','✎','©','®','™','Σ','✪','✯','☭','➳','卐','√','↖','↗','↘','↙','∴','∵','∶','∷','፠','፡','෴','።','፣','༒','༓','៖','፨','჻'];
const emojis = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱'];

function render(items, id) {
  const container = document.getElementById(id);
  items.forEach(char => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = char;
    div.onclick = () => copy(char);
    container.appendChild(div);
  });
}

function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 1000);
  });
}

render(symbols, 'symbols');
render(emojis, 'emojis');
</script>
</body>
</html>`,
    },
    {
      name: '密码生成器',
      description: '生成安全的随机密码，支持自定义长度和字符类型',
      icon: '🔐',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>密码生成器</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .form-group { margin-bottom: 20px; }
  label { display: block; margin-bottom: 8px; font-weight: 500; }
  input[type="number"] { width: 100%; padding: 10px; border: 1px solid #e4e4e7; border-radius: 4px; }
  .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
  .checkbox-group label { display: flex; align-items: center; font-weight: normal; }
  .checkbox-group input[type="checkbox"] { margin-right: 8px; }
  button { width: 100%; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
  button:hover { background: #4f46e5; }
  .result { margin-top: 20px; }
  .password-display { display: flex; gap: 10px; align-items: center; }
  .password-input { flex: 1; padding: 12px; border: 1px solid #e4e4e7; border-radius: 4px; font-family: monospace; font-size: 16px; background: #f8fafc; }
  .copy-btn { padding: 12px 20px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
  .copy-btn:hover { background: #059669; }
  .strength { margin-top: 10px; padding: 8px; border-radius: 4px; text-align: center; font-weight: 500; }
  .strength.weak { background: #fee2e2; color: #dc2626; }
  .strength.medium { background: #fef3c7; color: #d97706; }
  .strength.strong { background: #dcfce7; color: #16a34a; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; }
    .container { background: #27272a; }
    input, .password-input { background: #3f3f46; border-color: #52525b; color: #fafafa; }
    .strength.weak { background: #7f1d1d; }
    .strength.medium { background: #92400e; }
    .strength.strong { background: #14532d; }
  }
</style>
</head>
<body>
<div class="container">
  <h2 style="margin-bottom: 20px;">密码生成器</h2>
  
  <div class="form-group">
    <label for="length">密码长度:</label>
    <input type="number" id="length" min="4" max="128" value="16">
  </div>
  
  <div class="form-group">
    <label>包含字符类型:</label>
    <div class="checkbox-group">
      <label>
        <input type="checkbox" id="uppercase" checked>
        大写字母 (A-Z)
      </label>
      <label>
        <input type="checkbox" id="lowercase" checked>
        小写字母 (a-z)
      </label>
      <label>
        <input type="checkbox" id="numbers" checked>
        数字 (0-9)
      </label>
      <label>
        <input type="checkbox" id="symbols">
        特殊符号 (!@#$%^&*)
      </label>
    </div>
  </div>
  
  <button onclick="generatePassword()">生成密码</button>
  
  <div class="result">
    <div class="password-display">
      <input type="text" id="password" class="password-input" readonly placeholder="点击生成密码">
      <button class="copy-btn" onclick="copyPassword()">复制</button>
    </div>
    <div id="strength" class="strength"></div>
  </div>
</div>
<script>
function generatePassword() {
  const length = parseInt(document.getElementById('length').value);
  const useUppercase = document.getElementById('uppercase').checked;
  const useLowercase = document.getElementById('lowercase').checked;
  const useNumbers = document.getElementById('numbers').checked;
  const useSymbols = document.getElementById('symbols').checked;
  
  if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
    alert('请至少选择一种字符类型');
    return;
  }
  
  let charset = '';
  if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  document.getElementById('password').value = password;
  checkStrength(password);
}

function copyPassword() {
  const password = document.getElementById('password').value;
  if (!password) {
    alert('请先生成密码');
    return;
  }
  
  navigator.clipboard.writeText(password).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '已复制!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

function checkStrength(password) {
  const strengthEl = document.getElementById('strength');
  let strength = 0;
  let feedback = '';
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) {
    feedback = '弱密码';
    strengthEl.className = 'strength weak';
  } else if (strength <= 4) {
    feedback = '中等强度';
    strengthEl.className = 'strength medium';
  } else {
    feedback = '强密码';
    strengthEl.className = 'strength strong';
  }
  
  strengthEl.textContent = '密码强度: ' + feedback;
}

// 页面加载时自动生成一个密码
window.onload = generatePassword;
</script>
</body>
</html>`,
    },
    {
      name: '二维码生成器',
      description: '快速生成文本、网址的二维码',
      icon: '📱',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>二维码生成器</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f4f4f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .input-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; }
    textarea { width: 100%; height: 120px; padding: 12px; border: 1px solid #e4e4e7; border-radius: 6px; resize: vertical; font-family: inherit; }
    .size-control { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    input[type="range"] { flex: 1; }
    .size-display { min-width: 80px; text-align: center; font-weight: 500; }
    button { background-color: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500; }
    button:hover { background-color: #4f46e5; }
    button:active { transform: scale(0.98); }
    #qrcode { margin: 30px auto; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; min-height: 200px; display: flex; align-items: center; justify-content: center; }
    #qrcode img { border-radius: 8px; }
    .download-btn { background-color: #10b981; margin-left: 10px; }
    .download-btn:hover { background-color: #059669; }
    .error { color: #dc2626; margin-top: 10px; padding: 10px; background: #fee2e2; border-radius: 6px; }
    @media (prefers-color-scheme: dark) {
      body { background: #18181b; }
      .container { background: #27272a; }
      textarea { background: #3f3f46; border-color: #52525b; color: #fafafa; }
      #qrcode { background: #3f3f46; }
      .error { background: #7f1d1d; color: #fca5a5; }
    }
  </style>
</head>
<body>
<div class="container">
  <h2 style="margin-bottom: 20px;">二维码生成器</h2>
  
  <div class="input-group">
    <label for="text">输入内容:</label>
    <textarea id="text" placeholder="输入文本、网址或其他信息...">https://github.com</textarea>
  </div>
  
  <div class="size-control">
    <label>二维码尺寸:</label>
    <input type="range" id="size" min="128" max="512" value="256" step="32">
    <div class="size-display" id="sizeDisplay">256x256</div>
  </div>
  
  <button onclick="generateQR()">生成二维码</button>
  <button class="download-btn" onclick="downloadQR()" style="display: none;">下载二维码</button>
  
  <div id="qrcode">
    <div style="color: #94a3b8;">请输入内容并点击生成按钮</div>
  </div>
  
  <div id="error"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>
let qrcode = null;

function generateQR() {
  const text = document.getElementById('text').value.trim();
  const size = parseInt(document.getElementById('size').value);
  const qrcodeDiv = document.getElementById('qrcode');
  const errorDiv = document.getElementById('error');
  
  if (!text) {
    errorDiv.textContent = '请输入要生成二维码的内容';
    return;
  }
  
  errorDiv.textContent = '';
  qrcodeDiv.innerHTML = '';
  
  try {
    qrcode = new QRCode(qrcodeDiv, {
      text: text,
      width: size,
      height: size,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    
    document.querySelector('.download-btn').style.display = 'inline-block';
  } catch (e) {
    errorDiv.textContent = '生成二维码失败: ' + e.message;
  }
}

function downloadQR() {
  const img = document.querySelector('#qrcode img');
  if (!img) return;
  
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = img.src;
  link.click();
}

function updateSizeDisplay() {
  const size = document.getElementById('size').value;
  document.getElementById('sizeDisplay').textContent = size + 'x' + size;
}

document.getElementById('size').addEventListener('input', updateSizeDisplay);

// 页面加载时生成一个示例
window.onload = function() {
  generateQR();
};
</script>
</body>
</html>`,
    },
    {
      name: '颜色选择器',
      description: '在线选择颜色，获取HEX、RGB、HSL等格式值',
      icon: '🎨',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>颜色选择器</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .color-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
  .color-picker-section { text-align: center; }
  input[type="color"] { width: 150px; height: 150px; border: none; border-radius: 8px; cursor: pointer; }
  .preview-section { text-align: center; }
  .color-preview { width: 150px; height: 150px; border-radius: 8px; margin: 0 auto 20px; border: 2px solid #e4e4e7; }
  .format-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
  .format-item { background: #f8fafc; padding: 15px; border-radius: 6px; }
  .format-label { font-weight: 500; margin-bottom: 8px; color: #64748b; }
  .format-value { font-family: monospace; background: white; padding: 8px; border-radius: 4px; border: 1px solid #e4e4e7; cursor: pointer; }
  .format-value:hover { background: #e0e7ff; }
  .preset-colors { margin-top: 30px; }
  .preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 10px; }
  .preset-color { width: 40px; height: 40px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
  .preset-color:hover { transform: scale(1.1); border-color: #6366f1; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; }
    .container { background: #27272a; }
    .format-item { background: #3f3f46; }
    .format-value { background: #1f2937; border-color: #52525b; }
    .format-value:hover { background: #4f46e5; }
  }
</style>
</head>
<body>
<div class="container">
  <h2 style="margin-bottom: 20px;">颜色选择器</h2>
  
  <div class="color-section">
    <div class="color-picker-section">
      <label for="colorPicker">选择颜色:</label>
      <input type="color" id="colorPicker" value="#6366f1">
    </div>
    
    <div class="preview-section">
      <label>颜色预览:</label>
      <div class="color-preview" id="colorPreview"></div>
    </div>
  </div>
  
  <div class="format-section">
    <div class="format-item">
      <div class="format-label">HEX:</div>
      <div class="format-value" id="hexValue" onclick="copyToClipboard(this.textContent)">#6366f1</div>
    </div>
    <div class="format-item">
      <div class="format-label">RGB:</div>
      <div class="format-value" id="rgbValue" onclick="copyToClipboard(this.textContent)">rgb(99, 102, 241)</div>
    </div>
    <div class="format-item">
      <div class="format-label">HSL:</div>
      <div class="format-value" id="hslValue" onclick="copyToClipboard(this.textContent)">hsl(239, 84%, 67%)</div>
    </div>
    <div class="format-item">
      <div class="format-label">HSV:</div>
      <div class="format-value" id="hsvValue" onclick="copyToClipboard(this.textContent)">hsv(239, 59%, 95%)</div>
    </div>
  </div>
  
  <div class="preset-colors">
    <h3>预设颜色</h3>
    <div class="preset-grid" id="presetGrid"></div>
  </div>
</div>
<script>
const presetColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#000000', '#ffffff'
];

function init() {
  // 初始化预设颜色
  const presetGrid = document.getElementById('presetGrid');
  presetColors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'preset-color';
    div.style.backgroundColor = color;
    div.onclick = () => setColor(color);
    presetGrid.appendChild(div);
  });
  
  // 监听颜色选择器变化
  document.getElementById('colorPicker').addEventListener('input', updateColorValues);
  
  // 初始化颜色值
  updateColorValues();
}

function setColor(color) {
  document.getElementById('colorPicker').value = color;
  updateColorValues();
}

function updateColorValues() {
  const color = document.getElementById('colorPicker').value;
  
  // 更新预览
  document.getElementById('colorPreview').style.backgroundColor = color;
  
  // 转换为不同格式
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  
  // 更新显示值
  document.getElementById('hexValue').textContent = color.toUpperCase();
  document.getElementById('rgbValue').textContent = \`rgb(\${rgb.r}, \${rgb.g}, \${rgb.b})\`;
  document.getElementById('hslValue').textContent = \`hsl(\${hsl.h}, \${hsl.s}%, \${hsl.l}%)\`;
  document.getElementById('hsvValue').textContent = \`hsv(\${hsv.h}, \${hsv.s}%, \${hsv.v}%)\`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.createElement('div');
    toast.textContent = '已复制: ' + text;
    toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 20px; z-index: 1000;';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  });
}

init();
</script>
</body>
</html>`,
    }
  ];

  // 插入工具数据
  for (const tool of textTools) {
    await prisma.tool.create({
      data: {
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        code: tool.code,
        categoryId: textCategory.id,
        sortOrder: textTools.indexOf(tool) + 1,
      },
    });
  }

  for (const tool of devTools) {
    await prisma.tool.create({
      data: {
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        code: tool.code,
        categoryId: devCategory.id,
        sortOrder: devTools.indexOf(tool) + 1,
      },
    });
  }

  for (const tool of convertTools) {
    await prisma.tool.create({
      data: {
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        code: tool.code,
        categoryId: convertCategory.id,
        sortOrder: convertTools.indexOf(tool) + 1,
      },
    });
  }

  for (const tool of utilityTools) {
    await prisma.tool.create({
      data: {
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        code: tool.code,
        categoryId: utilityCategory.id,
        sortOrder: utilityTools.indexOf(tool) + 1,
      },
    });
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
