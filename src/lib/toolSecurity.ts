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

    // DOM 操作
    { pattern: /document\.write\s*\(/, type: 'error', message: '禁止使用 document.write()' },
    { pattern: /outerHTML\s*=/, type: 'error', message: '禁止使用 outerHTML 赋值' },

    // 危险的 Window 对象属性
    { pattern: /window\.location\s*=/, type: 'error', message: '禁止重定向页面' },

    // 代码注入 - 只检查外部脚本，允许内联脚本
    { pattern: /<script[^>]+src\s*=\s*["']https?:\/\/(?!cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)/i, type: 'error', message: '禁止加载不受信任的外部脚本，仅允许 cdn.jsdelivr.net 和 cdnjs.cloudflare.com' },
    { pattern: /import\s*\(/, type: 'error', message: '禁止动态导入模块' },
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

  // 移除敏感词检查 - 允许工具处理密码、token 等功能
  // 例如：密码生成器、密码强度检测等都是合法的工具

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
