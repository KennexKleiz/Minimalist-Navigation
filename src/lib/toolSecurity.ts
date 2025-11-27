// 工具安全性检查模块

interface SecurityCheckResult {
  isSafe: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * 检查工具代码的安全性
 */
export function checkToolSecurity(code: string): SecurityCheckResult {
  const result: SecurityCheckResult = {
    isSafe: true,
    warnings: [],
    errors: []
  };

  // 危险函数和模式列表
  const dangerousPatterns = [
    // 危险的全局对象
    { pattern: /eval\s*\(/, type: 'error', message: '禁止使用 eval() 函数' },
    { pattern: /Function\s*\(/, type: 'error', message: '禁止使用 Function 构造函数' },
    { pattern: /setTimeout\s*\(/, type: 'warning', message: 'setTimeout 可能被滥用，请谨慎使用' },
    { pattern: /setInterval\s*\(/, type: 'warning', message: 'setInterval 可能被滥用，请谨慎使用' },
    
    // DOM 操作
    { pattern: /document\.write\s*\(/, type: 'error', message: '禁止使用 document.write()' },
    { pattern: /innerHTML\s*=/, type: 'warning', message: 'innerHTML 可能导致 XSS 攻击，建议使用 textContent' },
    { pattern: /outerHTML\s*=/, type: 'error', message: '禁止使用 outerHTML 赋值' },
    
    // 网络请求
    { pattern: /XMLHttpRequest/, type: 'warning', message: 'XMLHttpRequest 需要谨慎使用，避免跨域问题' },
    { pattern: /fetch\s*\(/, type: 'warning', message: 'fetch 请求需要谨慎使用，确保目标安全' },
    
    // 存储操作
    { pattern: /localStorage\./, type: 'warning', message: 'localStorage 操作需要注意数据隐私' },
    { pattern: /sessionStorage\./, type: 'warning', message: 'sessionStorage 操作需要注意数据隐私' },
    { pattern: /indexedDB/, type: 'warning', message: 'indexedDB 操作需要注意数据隐私' },
    
    // 危险的 Window 对象属性
    { pattern: /window\.location\s*=/, type: 'error', message: '禁止重定向页面' },
    { pattern: /window\.open\s*\(/, type: 'warning', message: 'window.open 可能被用于恶意弹窗' },
    
    // 代码注入
    { pattern: /script\s*src\s*=/, type: 'error', message: '禁止动态加载外部脚本' },
    { pattern: /import\s*\(/, type: 'error', message: '禁止动态导入模块' },
    
    // 文件系统
    { pattern: /FileReader/, type: 'warning', message: 'FileReader 操作需要注意文件隐私' },
    { pattern: /Blob\s*\(/, type: 'warning', message: 'Blob 操作需要谨慎使用' },
  ];

  // 检查危险模式
  for (const { pattern, type, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      if (type === 'error') {
        result.errors.push(message);
        result.isSafe = false;
      } else {
        result.warnings.push(message);
      }
    }
  }

  // 检查是否包含外部链接
  const externalLinkPattern = /https?:\/\/(?!localhost|127\.0\.0\.1|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)/g;
  const externalLinks = code.match(externalLinkPattern);
  if (externalLinks) {
    result.warnings.push(`检测到外部链接: ${externalLinks.join(', ')}`);
  }

  // 检查代码长度
  if (code.length > 50000) {
    result.warnings.push('代码过长，建议控制在 50KB 以内');
  }

  return result;
}

/**
 * 清理和过滤用户输入
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 验证工具名称和描述
 */
export function validateToolMetadata(name: string, description: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查名称长度
  if (!name || name.trim().length === 0) {
    errors.push('工具名称不能为空');
  } else if (name.length > 50) {
    errors.push('工具名称不能超过 50 个字符');
  }

  // 检查描述长度
  if (description && description.length > 200) {
    errors.push('工具描述不能超过 200 个字符');
  }

  // 检查是否包含敏感词
  const sensitiveWords = ['密码', 'password', 'token', 'key', 'secret'];
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  for (const word of sensitiveWords) {
    if (lowerName.includes(word)) {
      errors.push(`工具名称不能包含敏感词: ${word}`);
    }
    if (lowerDesc.includes(word)) {
      errors.push(`工具描述不能包含敏感词: ${word}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 生成安全的内容策略头
 */
export function generateSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' data: blob: cdn.jsdelivr.net cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; img-src 'self' data: blob: https:;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}
