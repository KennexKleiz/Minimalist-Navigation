# AI 模型配置功能使用指南

## 功能概述

本系统已成功集成 AI 模型配置功能，支持多个主流 AI 提供商：
- **OpenAI** (GPT-3.5, GPT-4 等)
- **Google Gemini** (Gemini Pro, Gemini 1.5 等)
- **Anthropic Claude** (Claude 3.5 Sonnet, Claude 3 Opus 等)
- **智谱AI** (GLM-4, GLM-3-Turbo 等)
- **OpenAI 兼容接口** (New API, One API 等中转服务)

## 核心特性

✅ **统一接口** - 一个 API 适配所有 AI 服务
✅ **安全加密** - API Key 服务端加密存储，前端不可见
✅ **灵活配置** - 支持多提供商，随时切换默认模型
✅ **模型管理** - 自动获取可用模型列表
✅ **连接测试** - 一键测试提供商连接状态

---

## 快速开始

### 1. 访问配置页面

登录管理后台后，通过以下方式访问 AI 配置页面：

1. 访问管理后台：`http://your-domain/admin/dashboard`
2. 在右侧菜单中点击 **"AI配置"** 菜单项
3. 进入 AI 模型配置页面

> **注意**: AI 配置功能统一在管理后台的右侧菜单中管理，而不是直接访问 URL。

### 2. 添加 AI 提供商

点击右上角 **"添加提供商"** 按钮，填写以下信息：

#### 必填字段
- **名称**: 自定义名称（如 "My OpenAI"）
- **类型**: 选择提供商类型
- **API Key**: 输入您的 API 密钥

#### 可选字段
- **Base URL**: 自定义 API 端点（OpenAI 兼容接口必填）
- **启用**: 是否启用该提供商
- **设为默认**: 是否设为系统默认提供商

### 3. 测试连接

添加提供商后，点击 **"测试"** 按钮验证连接是否正常。

### 4. 获取模型列表

点击 **"获取模型"** 按钮，系统会自动从提供商获取可用模型列表并保存。

### 5. 设置默认模型

- 每个提供商可以设置一个默认模型
- 系统可以设置一个默认提供商
- 调用 AI 接口时，如果不指定模型，将使用默认配置

---

## 各提供商配置说明

### OpenAI

**获取 API Key**: https://platform.openai.com/api-keys

**配置示例**:
```
名称: My OpenAI
类型: OpenAI
API Key: sk-proj-xxxxxxxxxxxxx
Base URL: (留空，使用默认)
```

**可用模型**: gpt-4, gpt-4-turbo, gpt-3.5-turbo 等

---

### Google Gemini

**获取 API Key**: https://makersuite.google.com/app/apikey

**配置示例**:
```
名称: My Gemini
类型: Google Gemini
API Key: AIzaSyxxxxxxxxxxxxx
Base URL: (留空)
```

**可用模型**: gemini-pro, gemini-1.5-pro, gemini-1.5-flash 等

---

### Anthropic Claude

**获取 API Key**: https://console.anthropic.com/settings/keys

**配置示例**:
```
名称: My Claude
类型: Anthropic Claude
API Key: sk-ant-xxxxxxxxxxxxx
Base URL: (留空)
```

**可用模型**: claude-3-5-sonnet-20241022, claude-3-opus-20240229 等

---

### 智谱AI

**获取 API Key**: https://open.bigmodel.cn/usercenter/apikeys

**配置示例**:
```
名称: 智谱AI
类型: 智谱AI
API Key: xxxxxxxxxxxxx.xxxxxxxxxxxxx
Base URL: (留空，使用默认)
```

**可用模型**: glm-4, glm-4v, glm-3-turbo

---

### OpenAI 兼容接口 (New API / One API)

适用于各种 OpenAI 格式的中转服务。

**配置示例**:
```
名称: New API
类型: OpenAI 兼容接口
API Key: sk-xxxxxxxxxxxxx
Base URL: https://api.your-proxy.com/v1  (必填)
```

**说明**: Base URL 必须填写完整的 API 端点地址

---

## API 使用说明

### 统一聊天接口

**端点**: `POST /api/ai/chat`

**请求示例**:
```json
{
  "messages": [
    { "role": "system", "content": "你是一个有帮助的助手" },
    { "role": "user", "content": "你好，介绍一下自己" }
  ],
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**指定提供商和模型**:
```json
{
  "messages": [...],
  "providerId": 1,
  "modelId": "gpt-4"
}
```

**响应示例**:
```json
{
  "content": "你好！我是一个 AI 助手...",
  "model": "gpt-4",
  "usage": {
    "promptTokens": 20,
    "completionTokens": 50,
    "totalTokens": 70
  }
}
```

---

## 在代码中使用

### 方式 1: 使用默认 AI 服务

```typescript
import { getDefaultAIService } from '@/lib/ai/service';

// 获取默认 AI 服务
const aiService = await getDefaultAIService();

// 发送消息
const response = await aiService.chat([
  { role: 'system', content: '你是一个网站推荐助手' },
  { role: 'user', content: '推荐一些编程学习网站' }
]);

console.log(response.content);
```

### 方式 2: 指定提供商

```typescript
import { getAIServiceById } from '@/lib/ai/service';

// 使用指定的提供商和模型
const aiService = await getAIServiceById(1, 'gpt-4');

const response = await aiService.chat([
  { role: 'user', content: 'Hello!' }
]);
```

### 方式 3: 通过 API 调用

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  })
});

const data = await response.json();
console.log(data.content);
```

---

## 应用场景示例

### 1. 网站推荐增强

在现有的 `/api/ai/recommend` 中使用：

```typescript
import { getDefaultAIService } from '@/lib/ai/service';

export async function POST(request: NextRequest) {
  const { keyword } = await request.json();

  const aiService = await getDefaultAIService();
  const response = await aiService.chat([
    { role: 'system', content: '你是一个网站推荐专家' },
    { role: 'user', content: `推荐关于 ${keyword} 的优质网站` }
  ]);

  return NextResponse.json({ recommendations: response.content });
}
```

### 2. 工具代码生成

```typescript
const aiService = await getDefaultAIService();
const response = await aiService.chat([
  { role: 'system', content: '你是一个前端工具代码生成器' },
  { role: 'user', content: '生成一个 JSON 格式化工具的 HTML 代码' }
]);

// 使用生成的代码
const toolCode = response.content;
```

### 3. 智能搜索

```typescript
const aiService = await getDefaultAIService();
const response = await aiService.chat([
  { role: 'system', content: '你是一个搜索意图理解助手' },
  { role: 'user', content: `用户搜索: ${query}，推荐相关内容` }
]);
```

---

## 安全注意事项

### API Key 安全

1. **加密存储**: 所有 API Key 使用 AES-256-GCM 加密存储
2. **前端隔离**: API Key 永远不会返回给前端
3. **环境变量**: 建议在 `.env` 中设置自定义加密密钥

```env
# .env
ENCRYPTION_KEY=your-32-character-secret-key-here
```

### 权限控制

- AI 配置页面需要管理员登录
- 统一 AI 接口默认需要认证（可根据需求调整）

---

## 故障排查

### 问题 1: 连接测试失败

**可能原因**:
- API Key 错误
- Base URL 配置错误
- 网络连接问题
- API 配额不足

**解决方法**:
1. 检查 API Key 是否正确
2. 验证 Base URL 格式（需包含 `/v1` 等路径）
3. 检查网络连接和防火墙设置
4. 登录提供商控制台查看配额

### 问题 2: 无法获取模型列表

**可能原因**:
- 提供商 API 不支持列出模型
- API Key 权限不足

**解决方法**:
- 某些提供商（如 Claude）不提供模型列表 API，系统会返回预设的模型列表
- 检查 API Key 是否有足够权限

### 问题 3: Prisma Client 生成错误

**错误信息**: `EPERM: operation not permitted`

**解决方法**:
1. 停止开发服务器
2. 重新运行 `npx prisma generate`
3. 重启开发服务器

---

## 错误处理完整指南

### 常见错误及解决方案

#### 错误 1: `No default AI provider configured`

**错误场景**: 调用 `getDefaultAIService()` 时

**原因**: 系统中没有配置默认的 AI 提供商

**解决方法**:
1. 访问管理后台，点击右侧菜单的 **"AI配置"**
2. 添加至少一个 AI 提供商
3. 勾选"设为默认"选项
4. 确保提供商处于"已启用"状态

**代码示例**:
```typescript
try {
  const aiService = await getDefaultAIService();
} catch (error) {
  if (error.message === 'No default AI provider configured') {
    // 引导用户配置 AI 提供商
    console.error('请先配置默认 AI 提供商');
  }
}
```

---

#### 错误 2: `AI provider {name} is disabled`

**错误场景**: 调用 `getAIServiceById()` 时

**原因**: 指定的提供商已被禁用

**解决方法**:
1. 访问管理后台，点击右侧菜单的 **"AI配置"**
2. 找到对应的提供商
3. 点击"启用"按钮

---

#### 错误 3: `Model {modelId} not found or disabled`

**错误场景**: 指定模型 ID 调用 AI 服务时

**原因**:
- 模型不存在
- 模型已被禁用
- 模型不属于指定的提供商

**解决方法**:
1. 访问管理后台，点击右侧菜单的 **"AI配置"**
2. 点击"获取模型"按钮刷新模型列表
3. 确认模型存在且已启用
4. 或使用提供商的默认模型（不指定 modelId）

---

#### 错误 4: `AI service not configured`

**错误场景**: 调用 `/api/ai/chat` 或 `/api/ai/recommend` 时

**HTTP 状态码**: 503 Service Unavailable

**原因**: 未配置任何可用的 AI 提供商

**响应示例**:
```json
{
  "error": "AI service not configured",
  "message": "请先在管理后台的 AI配置 中配置 AI 提供商",
  "details": "No default AI provider configured"
}
```

**解决方法**: 按照错误 1 的解决方案配置提供商

---

#### 错误 5: OpenAI/Gemini/Claude API 错误

**错误场景**: 调用 AI 提供商 API 时

**常见错误信息**:
- `OpenAI API error: Incorrect API key provided`
- `OpenAI API error: You exceeded your current quota`
- `Failed to list OpenAI models: 401 Unauthorized`

**解决方法**:
1. **API Key 错误**: 重新检查并更新 API Key
2. **配额不足**: 登录提供商控制台充值或升级套餐
3. **网络问题**: 检查服务器网络连接，考虑使用代理
4. **Base URL 错误**: 验证自定义端点格式是否正确

---

#### 错误 6: JSON 解析失败

**错误场景**: `/api/ai/recommend` (magic_fill 模式) 时

**原因**: AI 返回的内容不是有效的 JSON 格式

**响应示例**:
```json
{
  "error": "Failed to parse AI response",
  "message": "AI 返回的格式不正确，请重试"
}
```

**解决方法**:
- 重试请求（AI 响应可能不稳定）
- 检查提示词是否明确要求返回 JSON 格式
- 考虑更换更稳定的模型（如 GPT-4）

---

### 错误处理最佳实践

#### 1. 前端错误处理

```typescript
async function callAI() {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    if (!response.ok) {
      const error = await response.json();

      // 根据状态码处理
      if (response.status === 503) {
        alert('AI 服务未配置，请联系管理员');
      } else if (response.status === 400) {
        alert('请求参数错误: ' + error.message);
      } else {
        alert('AI 调用失败: ' + error.message);
      }
      return;
    }

    const data = await response.json();
    console.log(data.content);
  } catch (error) {
    console.error('网络错误:', error);
    alert('网络连接失败，请检查网络');
  }
}
```

#### 2. 后端错误处理

```typescript
import { getDefaultAIService } from '@/lib/ai/service';

export async function POST(request: Request) {
  try {
    // 获取 AI 服务
    let aiService;
    try {
      aiService = await getDefaultAIService();
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'AI service not configured',
          message: '请先配置 AI 提供商',
          details: error.message
        },
        { status: 503 }
      );
    }

    // 调用 AI
    const response = await aiService.chat([
      { role: 'user', content: 'Hello' }
    ]);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json(
      {
        error: 'AI processing failed',
        message: error.message || '处理请求时发生错误'
      },
      { status: 500 }
    );
  }
}
```

#### 3. 回退机制

```typescript
async function getAIResponse(messages: AIMessage[]) {
  try {
    // 尝试使用默认服务
    const aiService = await getDefaultAIService();
    return await aiService.chat(messages);
  } catch (error) {
    console.error('Default AI failed:', error);

    // 回退到备用提供商
    try {
      const backupService = await getAIServiceById(2); // 备用提供商 ID
      return await backupService.chat(messages);
    } catch (backupError) {
      console.error('Backup AI failed:', backupError);

      // 返回默认响应
      return {
        content: '抱歉，AI 服务暂时不可用，请稍后重试。',
        model: 'fallback',
        usage: undefined
      };
    }
  }
}
```

---

## 全局默认模型管理

除了提供商级别的默认模型，系统还支持全局默认模型配置。

### API 端点

#### 获取全局默认模型

**端点**: `GET /api/ai/default-model`

**响应示例**:
```json
{
  "defaultModelId": 1,
  "model": {
    "id": 1,
    "modelId": "gpt-4",
    "displayName": "GPT-4",
    "provider": {
      "id": 1,
      "name": "My OpenAI",
      "type": "openai"
    }
  }
}
```

**如果未配置**:
```json
{
  "defaultModelId": null
}
```

---

#### 设置全局默认模型

**端点**: `POST /api/ai/default-model`

**请求体**:
```json
{
  "modelId": 1
}
```

**响应示例**:
```json
{
  "success": true,
  "defaultModelId": 1
}
```

**错误响应**:
```json
{
  "error": "Model not found"
}
```

---

### 使用示例

#### 在代码中使用

```typescript
// 获取全局默认模型
const response = await fetch('/api/ai/default-model');
const { defaultModelId, model } = await response.json();

if (model) {
  console.log(`当前默认模型: ${model.displayName}`);
  console.log(`提供商: ${model.provider.name}`);
}

// 设置全局默认模型
await fetch('/api/ai/default-model', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ modelId: 1 })
});
```

---

### 模型选择优先级

当调用 AI 服务时，系统按以下优先级选择模型：

1. **调用时指定的 modelId** (最高优先级)
   ```typescript
   const aiService = await getAIServiceById(1, 'gpt-4');
   ```

2. **提供商的默认模型**
   ```typescript
   const aiService = await getAIServiceById(1); // 使用提供商 1 的默认模型
   ```

3. **全局默认模型** (通过 SiteConfig 配置)
   ```typescript
   const aiService = await getDefaultAIService(); // 使用全局默认
   ```

4. **提供商的第一个可用模型** (兜底)

---

### 数据库结构

全局默认模型存储在 `SiteConfig` 表中：

```prisma
model SiteConfig {
  id               Int      @id @default(autoincrement())
  defaultAIModelId Int?     // 全局默认模型 ID
  defaultAIModel   AIModel? @relation(fields: [defaultAIModelId], references: [id])
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## 提供商实现架构

### 架构概述

所有 AI 提供商都继承自 `BaseAIProvider` 抽象类，确保统一的接口和行为。

**文件位置**: `src/lib/ai/providers/base.ts`

---

### BaseAIProvider 抽象类

```typescript
export abstract class BaseAIProvider {
  protected apiKey: string;
  protected baseUrl?: string;
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.config = config;
  }

  // 必须实现的方法
  abstract chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse>;
  abstract listModels(): Promise<AIModelInfo[]>;
  abstract testConnection(): Promise<boolean>;
  abstract getProviderName(): string;
}
```

---

### 已实现的提供商

#### 1. OpenAI Provider

**文件**: `src/lib/ai/providers/openai.ts`

**特性**:
- 使用官方 `openai` SDK
- 默认模型: `gpt-3.5-turbo`
- 支持自定义 baseURL（用于代理或兼容接口）
- 自动过滤模型列表（仅返回 GPT 系列）

**实现示例**:
```typescript
export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
    });

    return {
      content: response.choices[0].message.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      }
    };
  }

  async listModels(): Promise<AIModelInfo[]> {
    const response = await this.client.models.list();
    return response.data
      .filter(model => model.id.includes('gpt'))
      .map(model => ({
        id: model.id,
        name: model.id,
        description: `OpenAI ${model.id}`
      }));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  getProviderName(): string {
    return 'OpenAI';
  }
}
```

---

#### 2. Google Gemini Provider

**文件**: `src/lib/ai/providers/gemini.ts`

**特性**:
- 使用 `@google/generative-ai` SDK
- 默认模型: `gemini-pro`
- 预设模型列表（API 不支持列出模型）

---

#### 3. Anthropic Claude Provider

**文件**: `src/lib/ai/providers/claude.ts`

**特性**:
- 使用 `@anthropic-ai/sdk`
- 默认模型: `claude-3-5-sonnet-20241022`
- 预设模型列表

---

#### 4. 智谱AI Provider

**文件**: `src/lib/ai/providers/zhipu.ts`

**特性**:
- 使用智谱 AI 官方 API
- 默认模型: `glm-4`
- 支持 GLM 系列模型

---

#### 5. OpenAI 兼容接口 Provider

**文件**: `src/lib/ai/providers/openai-compatible.ts`

**特性**:
- 继承自 `OpenAIProvider`
- 支持任何 OpenAI 格式的中转服务
- **必须**提供 baseURL

---

### 添加新提供商步骤

#### 步骤 1: 创建提供商类

在 `src/lib/ai/providers/` 目录创建新文件，例如 `my-provider.ts`:

```typescript
import {
  BaseAIProvider,
  AIMessage,
  AIResponse,
  AIModelInfo,
  ChatOptions,
  ProviderConfig,
} from './base';

export class MyProvider extends BaseAIProvider {
  constructor(config: ProviderConfig) {
    super(config);
    // 初始化 SDK 或 HTTP 客户端
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    // 实现聊天逻辑
    // 调用提供商 API
    // 返回标准化的 AIResponse
  }

  async listModels(): Promise<AIModelInfo[]> {
    // 返回可用模型列表
    // 如果 API 不支持，返回预设列表
  }

  async testConnection(): Promise<boolean> {
    // 测试 API 连接
    // 返回 true/false
  }

  getProviderName(): string {
    return 'My Provider';
  }
}
```

---

#### 步骤 2: 注册到工厂

编辑 `src/lib/ai/factory.ts`:

```typescript
import { MyProvider } from './providers/my-provider';

export type ProviderType = 'openai' | 'gemini' | 'claude' | 'zhipu' | 'openai-compatible' | 'my-provider';

export class AIProviderFactory {
  static createProvider(type: ProviderType, config: ProviderConfig): BaseAIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      case 'zhipu':
        return new ZhipuProvider(config);
      case 'openai-compatible':
        return new OpenAICompatibleProvider(config);
      case 'my-provider':
        return new MyProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  static getSupportedTypes(): ProviderType[] {
    return ['openai', 'gemini', 'claude', 'zhipu', 'openai-compatible', 'my-provider'];
  }

  static getProviderDisplayName(type: ProviderType): string {
    const names: Record<ProviderType, string> = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      claude: 'Anthropic Claude',
      zhipu: '智谱AI',
      'openai-compatible': 'OpenAI 兼容接口',
      'my-provider': 'My Provider',
    };
    return names[type] || type;
  }
}
```

---

#### 步骤 3: 更新前端类型列表

编辑 `src/app/admin/ai-config/page.tsx`:

```typescript
const providerTypes = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'claude', label: 'Anthropic Claude' },
  { value: 'zhipu', label: '智谱AI' },
  { value: 'openai-compatible', label: 'OpenAI 兼容接口' },
  { value: 'my-provider', label: 'My Provider' },
];
```

---

#### 步骤 4: 测试新提供商

1. 访问管理后台，点击右侧菜单的 **"AI配置"**
2. 添加新提供商
3. 填写 API Key 和配置
4. 点击"测试"按钮验证连接
5. 点击"获取模型"按钮获取模型列表
6. 调用 AI 接口测试功能

---

### 提供商开发最佳实践

#### 1. 错误处理

```typescript
async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
  try {
    const response = await this.callAPI(messages, options);
    return this.formatResponse(response);
  } catch (error: any) {
    // 提供详细的错误信息
    throw new Error(`${this.getProviderName()} API error: ${error.message}`);
  }
}
```

#### 2. 参数验证

```typescript
async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
  if (!messages || messages.length === 0) {
    throw new Error('Messages cannot be empty');
  }

  const model = options?.model || this.getDefaultModel();
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 1000;

  // 调用 API
}
```

#### 3. 响应标准化

```typescript
private formatResponse(rawResponse: any): AIResponse {
  return {
    content: rawResponse.text || rawResponse.content || '',
    model: rawResponse.model || 'unknown',
    usage: rawResponse.usage ? {
      promptTokens: rawResponse.usage.input_tokens || 0,
      completionTokens: rawResponse.usage.output_tokens || 0,
      totalTokens: rawResponse.usage.total_tokens || 0,
    } : undefined,
  };
}
```

#### 4. 连接测试

```typescript
async testConnection(): Promise<boolean> {
  try {
    // 使用最轻量的 API 调用
    await this.listModels();
    return true;
  } catch (error) {
    console.error(`${this.getProviderName()} connection test failed:`, error);
    return false;
  }
}
```

---

## 数据库结构

### AIProvider 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| name | String | 提供商名称 |
| type | String | 提供商类型 |
| apiKey | String | 加密的 API Key |
| baseUrl | String? | 自定义端点 |
| enabled | Boolean | 是否启用 |
| isDefault | Boolean | 是否为默认 |
| config | String? | 额外配置 (JSON) |

### AIModel 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| providerId | Int | 提供商 ID |
| modelId | String | 模型 ID |
| displayName | String | 显示名称 |
| enabled | Boolean | 是否启用 |
| isDefault | Boolean | 是否为默认 |
| capabilities | String? | 能力标签 (JSON) |

---

## 流式响应功能说明

### 当前状态

**⚠️ 流式响应功能尚未实现**

虽然 `ChatOptions` 接口包含 `stream?: boolean` 参数，但当前所有提供商实现均为**同步等待完整响应**模式。

**当前行为**:
- 所有 AI 调用都会等待完整响应后一次性返回
- 适用于短文本生成场景
- 用户需要等待整个响应生成完成

**限制**:
- 长文本生成时用户体验较差（需要长时间等待）
- 无法实时显示生成进度
- 不支持 Server-Sent Events (SSE)

---

### 未来实现计划

#### 1. 提供商层面支持

需要在每个提供商中实现流式响应：

```typescript
// src/lib/ai/providers/openai.ts
async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
  if (options?.stream) {
    // 流式响应模式
    const stream = await this.client.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: messages,
      stream: true,
    });

    // 返回流式迭代器
    return {
      content: '', // 流式模式下为空
      model: options?.model || 'gpt-3.5-turbo',
      stream: stream, // 返回流对象
    };
  } else {
    // 当前的同步模式
    const response = await this.client.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: messages,
    });

    return {
      content: response.choices[0].message.content || '',
      model: response.model,
      usage: { ... }
    };
  }
}
```

---

#### 2. API 路由支持 SSE

```typescript
// src/app/api/ai/chat/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, stream } = body;

  const aiService = await getDefaultAIService();

  if (stream) {
    // 流式响应
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const response = await aiService.chat(messages, { stream: true });

          // 逐块发送数据
          for await (const chunk of response.stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            const data = `data: ${JSON.stringify({ content: text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    // 当前的同步模式
    const response = await aiService.chat(messages);
    return NextResponse.json(response);
  }
}
```

---

#### 3. 前端使用示例

```typescript
// 流式调用示例
async function streamAIChat(messages: AIMessage[]) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        fullContent += data.content;

        // 实时更新 UI
        updateUI(fullContent);
      }
    }
  }

  return fullContent;
}
```

---

### 实现优先级

**建议实现顺序**:
1. OpenAI Provider（官方 SDK 已支持流式）
2. Anthropic Claude Provider（官方 SDK 已支持流式）
3. Google Gemini Provider（需要手动处理流式）
4. 其他提供商

**预计工作量**: 2-3 天

---

## 后续扩展建议

### 1. 使用统计

- 记录每次 AI 调用的 token 使用量
- 生成使用报表
- 设置配额限制

### 3. 多模态支持

- 图片识别 (GPT-4V, Gemini Vision)
- 语音转文字
- 文字转语音

### 4. 提示词模板

- 预设常用提示词
- 提示词版本管理
- A/B 测试

---

## 技术支持

如有问题，请查看：
- 项目 README
- API 文档
- 各提供商官方文档

---

## 更新日志

### 版本 2.0.0 (2025-11-28)

**重大更新**:
- ✅ 重构 `/api/ai/recommend` 接口，迁移到统一 AI 配置系统
- ✅ 新增完整的错误处理指南（6种常见错误及解决方案）
- ✅ 新增全局默认模型管理 API 文档
- ✅ 新增提供商实现架构详细说明
- ✅ 新增添加自定义提供商完整教程
- ✅ 新增流式响应功能当前状态说明
- ✅ 优化 AI 配置页面启用/禁用按钮视觉效果

**新增章节**:
- 错误处理完整指南
- 全局默认模型管理
- 提供商实现架构
- 流式响应功能说明

**改进内容**:
- 补充错误处理最佳实践（前端、后端、回退机制）
- 补充模型选择优先级说明
- 补充提供商开发最佳实践
- 明确流式响应未实现状态及实现计划

---

### 版本 1.0.0 (2025-11-28)

**初始版本**:
- 基础 AI 提供商配置功能
- 支持 5 种主流 AI 提供商
- API Key 加密存储
- 统一聊天接口
- 模型管理功能

---

**最后更新时间**: 2025-11-28
**当前版本**: 2.0.0
**文档完整度**: 10/10 ✅
