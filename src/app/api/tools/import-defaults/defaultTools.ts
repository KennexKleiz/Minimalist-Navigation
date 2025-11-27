// 从 prisma/seed.ts 提取的默认工具数据
// 这个文件包含所有内置工具的定义

export function getDefaultTools() {
  return [
    {
      name: '文字处理',
      sortOrder: 1,
      tools: [
        {
          name: '文本去重',
          description: '在线去除文本中的重复行，支持按行去重',
          icon: '📝',
          sortOrder: 1,
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
</html>`
        },
        {
          name: '汉字转拼音',
          description: '在线将汉字转换为拼音，支持声调显示',
          icon: '🔤',
          sortOrder: 2,
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
</html>`
        },
        {
          name: '文本对比工具',
          description: '在线比较两段文本的差异，高亮显示不同之处',
          icon: '⚖️',
          sortOrder: 3,
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
</html>`
        }
      ]
    },
    {
      name: '开发工具',
      sortOrder: 2,
      tools: [
        {
          name: 'JSON格式化工具',
          description: '在线格式化和验证JSON数据，支持压缩和美化',
          icon: '🔧',
          sortOrder: 1,
          code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>JSON格式化</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  textarea { width: 100%; height: 400px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; }
  button { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #fff; }
    .container { background: #27272a; }
    textarea { background: #3f3f46; color: #fff; border-color: #52525b; }
  }
</style>
</head>
<body>
<div class="container">
  <div style="margin-bottom: 15px;">
    <button onclick="formatJSON()">格式化</button>
    <button onclick="compressJSON()">压缩</button>
    <button onclick="clearAll()">清空</button>
  </div>
  <div class="grid">
    <div>
      <h3>输入 JSON</h3>
      <textarea id="input" placeholder='{"name": "张三"}'></textarea>
      <div id="error" style="color: red; font-size: 12px;"></div>
    </div>
    <div>
      <h3>格式化结果</h3>
      <textarea id="output" readonly></textarea>
    </div>
  </div>
</div>
<script>
function formatJSON() {
  try {
    const json = JSON.parse(document.getElementById('input').value);
    document.getElementById('output').value = JSON.stringify(json, null, 2);
    document.getElementById('error').textContent = '';
  } catch (e) {
    document.getElementById('error').textContent = 'JSON 格式错误: ' + e.message;
  }
}
function compressJSON() {
  try {
    const json = JSON.parse(document.getElementById('input').value);
    document.getElementById('output').value = JSON.stringify(json);
    document.getElementById('error').textContent = '';
  } catch (e) {
    document.getElementById('error').textContent = 'JSON 格式错误: ' + e.message;
  }
}
function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
  document.getElementById('error').textContent = '';
}
</script>
</body>
</html>`
        },
        {
          name: 'Base64编码/解码',
          description: '在线进行Base64编码和解码操作',
          icon: '🔐',
          sortOrder: 2,
          code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>Base64编码/解码</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  textarea { width: 100%; height: 200px; margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
  button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #fff; }
    .container { background: #27272a; }
    textarea { background: #3f3f46; color: #fff; border-color: #52525b; }
  }
</style>
</head>
<body>
<div class="container">
  <h3>原文</h3>
  <textarea id="input" placeholder="输入要编码或解码的文本..."></textarea>
  <div>
    <button onclick="encode()">编码 → Base64</button>
    <button onclick="decode()">解码 ← Base64</button>
    <button onclick="clearAll()">清空</button>
  </div>
  <h3>结果</h3>
  <textarea id="output" readonly></textarea>
</div>
<script>
function encode() {
  try {
    const encoded = btoa(unescape(encodeURIComponent(document.getElementById('input').value)));
    document.getElementById('output').value = encoded;
  } catch (e) {
    document.getElementById('output').value = '编码失败: ' + e.message;
  }
}
function decode() {
  try {
    const decoded = decodeURIComponent(escape(atob(document.getElementById('input').value)));
    document.getElementById('output').value = decoded;
  } catch (e) {
    document.getElementById('output').value = '解码失败: ' + e.message;
  }
}
function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
}
</script>
</body>
</html>`
        }
      ]
    },
    {
      name: '格式转换',
      sortOrder: 3,
      tools: [
        {
          name: '英文大小写转换',
          description: '在线进行英文大小写转换，支持全大写、全小写、首字母大写等',
          icon: '🔠',
          sortOrder: 1,
          code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>大小写转换</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; }
  button { padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
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
  <div>
    <button onclick="transform('upper')">全大写</button>
    <button onclick="transform('lower')">全小写</button>
    <button onclick="transform('capitalize')">首字母大写</button>
  </div>
</div>
<script>
function transform(type) {
  const el = document.getElementById('text');
  let text = el.value;
  switch(type) {
    case 'upper': text = text.toUpperCase(); break;
    case 'lower': text = text.toLowerCase(); break;
    case 'capitalize': text = text.replace(/\\b\\w/g, c => c.toUpperCase()); break;
  }
  el.value = text;
}
</script>
</body>
</html>`
        },
        {
          name: 'URL提取器',
          description: '从文本中批量提取所有网址链接',
          icon: '🔗',
          sortOrder: 2,
          code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>URL提取器</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }
  button { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #eee; }
    .container { background: #27272a; }
    textarea { background: #3f3f46; color: #eee; border-color: #52525b; }
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
</html>`
        }
      ]
    },
    {
      name: '实用工具',
      sortOrder: 4,
      tools: [
        {
          name: '特殊符号表情大全',
          description: '常用特殊符号、颜文字、Emoji表情复制',
          icon: '😊',
          sortOrder: 1,
          code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>特殊符号</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); gap: 10px; }
  .item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; text-align: center; cursor: pointer; font-size: 20px; }
  .item:hover { background: #e0e7ff; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; color: #eee; }
    .container { background: #27272a; }
    .item { background: #3f3f46; border-color: #52525b; }
    .item:hover { background: #4f46e5; }
  }
</style>
</head>
<body>
<div class="container">
  <h3>常用符号</h3>
  <div class="grid" id="symbols"></div>
  <h3>Emoji 表情</h3>
  <div class="grid" id="emojis"></div>
</div>
<script>
const symbols = ['★','☆','✦','✧','▲','△','▼','▽','◆','◇','○','◎','●','℃','‰','℉','℗','®','©','™','✓','✔','✕','✖','✗','✘','❤','♡','♥','❥','웃','유','♋','☮','✌','☏','☢','☠','✔','☑','♚','▲','♪','✈','✞','÷','↑','↓','◆','◇','⊙','■','□','△','▽','¿','─','│','♥','❣','♂','♀','☿','Ⓐ','✍','✉','☣','☤','✘','☒','♛','▼','♫','⌘','☪','≈','←','→','◈','◎','☉','★','☆','⊿','※','¡','━','┃','♡','ღ','ツ','☼','☁','❅','♒','✎','©','®','™','Σ','✪','✯','☭','➳','卐','√','↖','↗','↘','↙','∴','∵','∶','∷','፠','፡','෴','።','፣','༒','༓','៖','፨','჻'];
const emojis = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱'];

function render(items, id) {
  const container = document.getElementById(id);
  items.forEach(char => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = char;
    div.onclick = () => navigator.clipboard.writeText(char);
    container.appendChild(div);
  });
}

render(symbols, 'symbols');
render(emojis, 'emojis');
</script>
</body>
</html>`
        },
        {
          name: '密码生成器',
          description: '生成安全的随机密码，支持自定义长度和字符类型',
          icon: '🔐',
          sortOrder: 2,
          code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>密码生成器</title>
<style>
  body { font-family: sans-serif; padding: 20px; background: #f4f4f5; }
  .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
  input[type="number"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; }
  button { width: 100%; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px; }
  .password-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #18181b; }
    .container { background: #27272a; }
    input { background: #3f3f46; border-color: #52525b; color: #fafafa; }
  }
</style>
</head>
<body>
<div class="container">
  <h2>密码生成器</h2>
  <label>密码长度:</label>
  <input type="number" id="length" min="4" max="128" value="16">
  <div>
    <label><input type="checkbox" id="uppercase" checked> 大写字母 (A-Z)</label><br>
    <label><input type="checkbox" id="lowercase" checked> 小写字母 (a-z)</label><br>
    <label><input type="checkbox" id="numbers" checked> 数字 (0-9)</label><br>
    <label><input type="checkbox" id="symbols"> 特殊符号 (!@#$%^&*)</label>
  </div>
  <button onclick="generatePassword()">生成密码</button>
  <input type="text" id="password" class="password-input" readonly placeholder="点击生成密码">
</div>
<script>
function generatePassword() {
  const length = parseInt(document.getElementById('length').value);
  const useUppercase = document.getElementById('uppercase').checked;
  const useLowercase = document.getElementById('lowercase').checked;
  const useNumbers = document.getElementById('numbers').checked;
  const useSymbols = document.getElementById('symbols').checked;

  let charset = '';
  if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset) { alert('请至少选择一种字符类型'); return; }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  document.getElementById('password').value = password;
}
window.onload = generatePassword;
</script>
</body>
</html>`
        }
      ]
    }
  ];
}
