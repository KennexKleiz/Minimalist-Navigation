'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  RefreshCw,
  TestTube,
  Star,
  Power,
} from 'lucide-react';

interface AIModel {
  id: number;
  modelId: string;
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
}

interface AIProvider {
  id: number;
  name: string;
  type: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  isDefault: boolean;
  hasApiKey: boolean;
  models: AIModel[];
}

interface AIConfigPanelProps {
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function AIConfigPanel({ showToast }: AIConfigPanelProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingProvider, setTestingProvider] = useState<number | null>(null);
  const [fetchingModels, setFetchingModels] = useState<number | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'openai',
    apiKey: '',
    baseUrl: '',
    enabled: true,
    isDefault: false,
  });

  // 加载提供商列表
  const loadProviders = async () => {
    try {
      const response = await fetch('/api/ai-providers', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load providers');
      const data = await response.json();
      setProviders(data);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'openai',
      apiKey: '',
      baseUrl: '',
      enabled: true,
      isDefault: false,
    });
    setEditingProvider(null);
    setShowAddForm(false);
  };

  // 添加提供商
  const handleAdd = async () => {
    try {
      const response = await fetch('/api/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add provider');
      }

      showToast('提供商添加成功', 'success');
      resetForm();
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 更新提供商
  const handleUpdate = async () => {
    if (!editingProvider) return;

    try {
      const response = await fetch('/api/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingProvider.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update provider');
      }

      showToast('提供商更新成功', 'success');
      resetForm();
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 删除提供商
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个提供商吗？')) return;

    try {
      const response = await fetch(`/api/ai-providers?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete provider');

      showToast('提供商删除成功', 'success');
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 测试连接
  const handleTest = async (id: number) => {
    setTestingProvider(id);
    try {
      const response = await fetch(`/api/ai-providers/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        showToast('连接测试成功', 'success');
      } else {
        showToast(`连接测试失败: ${result.message}`, 'error');
      }
    } catch (error: any) {
      showToast('连接测试失败', 'error');
    } finally {
      setTestingProvider(null);
    }
  };

  // 获取模型列表
  const handleFetchModels = async (id: number) => {
    setFetchingModels(id);
    try {
      const response = await fetch(`/api/ai-providers/${id}/models`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch models');
      }

      const models = await response.json();

      // 保存模型到数据库
      const saveResponse = await fetch(`/api/ai-providers/${id}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          models: models.map((m: any, index: number) => ({
            id: m.id,
            name: m.name,
            enabled: true,
            isDefault: index === 0,
          })),
        }),
      });

      if (!saveResponse.ok) throw new Error('Failed to save models');

      showToast(`成功获取 ${models.length} 个模型`, 'success');
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setFetchingModels(null);
    }
  };

  // 编辑提供商
  const startEdit = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: '***',
      baseUrl: provider.baseUrl || '',
      enabled: provider.enabled,
      isDefault: provider.isDefault,
    });
    setShowAddForm(true);
  };

  // 切换启用状态
  const toggleEnabled = async (provider: AIProvider) => {
    try {
      const response = await fetch('/api/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: provider.id,
          name: provider.name,
          type: provider.type,
          apiKey: '***',
          baseUrl: provider.baseUrl,
          enabled: !provider.enabled,
          isDefault: provider.isDefault,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle provider');

      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 设置为默认
  const setAsDefault = async (provider: AIProvider) => {
    try {
      const response = await fetch('/api/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: provider.id,
          name: provider.name,
          type: provider.type,
          apiKey: '***',
          baseUrl: provider.baseUrl,
          enabled: provider.enabled,
          isDefault: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to set default provider');

      showToast('已设置为默认提供商', 'success');
      loadProviders();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'claude', label: 'Anthropic Claude' },
    { value: 'zhipu', label: '智谱AI' },
    { value: 'openai-compatible', label: 'OpenAI 兼容接口' },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">AI 模型配置</h2>
          <p className="text-sm text-muted-foreground mt-1">
            管理 AI 提供商和模型配置
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          添加提供商
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProvider ? '编辑提供商' : '添加提供商'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="例如: My OpenAI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              >
                {providerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                placeholder={editingProvider ? '留空则不修改' : '输入 API Key'}
              />
            </div>

            {(formData.type === 'openai-compatible' || formData.baseUrl) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Base URL {formData.type === 'openai-compatible' && '(必填)'}
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  placeholder="https://api.example.com/v1"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">启用</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">设为默认</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingProvider ? handleUpdate : handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              {editingProvider ? '更新' : '添加'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 提供商列表 */}
      <div className="space-y-4">
        {providers.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">还没有配置任何 AI 提供商</p>
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    {provider.isDefault && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        默认
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        provider.enabled
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {provider.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    类型: {providerTypes.find((t) => t.value === provider.type)?.label}
                  </p>
                  {provider.baseUrl && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Base URL: {provider.baseUrl}
                    </p>
                  )}

                  {/* 模型列表 */}
                  {provider.models.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        已配置模型 ({provider.models.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {provider.models.map((model) => (
                          <span
                            key={model.id}
                            className={`px-3 py-1 text-xs rounded-full ${
                              model.isDefault
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {model.displayName}
                            {model.isDefault && ' (默认)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleTest(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {testingProvider === provider.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    测试
                  </button>

                  <button
                    onClick={() => handleFetchModels(provider.id)}
                    disabled={fetchingModels === provider.id}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {fetchingModels === provider.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    获取模型
                  </button>

                  <button
                    onClick={() => toggleEnabled(provider)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap font-medium ${
                      provider.enabled
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {provider.enabled ? '禁用' : '启用'}
                  </button>

                  {!provider.isDefault && (
                    <button
                      onClick={() => setAsDefault(provider)}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm whitespace-nowrap"
                    >
                      <Star className="w-4 h-4" />
                      设为默认
                    </button>
                  )}

                  <button
                    onClick={() => startEdit(provider)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>

                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 全局默认模型选择器 */}
      {providers.some(p => p.models.length > 0) && (
        <GlobalDefaultModelSelector
          providers={providers}
          showToast={showToast}
          onModelChange={loadProviders}
        />
      )}

      {/* 前端调用说明 */}
      <UsageGuide />
    </div>
  );
}

// 全局默认模型选择器组件
function GlobalDefaultModelSelector({
  providers,
  showToast,
  onModelChange
}: {
  providers: AIProvider[];
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  onModelChange: () => void;
}) {
  const [defaultModelId, setDefaultModelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  // 获取所有可用模型
  const allModels = providers.flatMap(provider =>
    provider.models
      .filter(m => m.enabled && provider.enabled)
      .map(model => ({
        ...model,
        providerName: provider.name,
        providerType: provider.type,
      }))
  );

  // 加载当前默认模型
  useEffect(() => {
    const loadDefaultModel = async () => {
      try {
        const response = await fetch('/api/ai/default-model', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setDefaultModelId(data.defaultModelId);
        }
      } catch (error) {
        console.error('Failed to load default model:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDefaultModel();
  }, [providers]);

  // 设置默认模型
  const handleSetDefaultModel = async (modelId: number) => {
    try {
      const response = await fetch('/api/ai/default-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ modelId }),
      });

      if (!response.ok) throw new Error('Failed to set default model');

      setDefaultModelId(modelId);
      showToast('全局默认模型设置成功', 'success');
      onModelChange();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // 测试默认模型连接
  const handleTestDefaultModel = async () => {
    if (!defaultModelId) {
      showToast('请先选择默认模型', 'warning');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: '请回复"连接成功"，这是一个测试消息。'
            }
          ],
          temperature: 0.1,
          maxTokens: 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.content) {
        const currentModel = allModels.find(m => m.id === defaultModelId);
        showToast(
          `✅ 模型测试成功！\n模型：${currentModel?.providerName} - ${currentModel?.displayName}\n响应：${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
          'success'
        );
      } else {
        throw new Error('响应格式异常');
      }
    } catch (error: any) {
      console.error('模型测试失败:', error);
      showToast(`❌ 模型测试失败：${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">全局默认模型</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        选择一个默认模型用于前端调用。当调用 AI 接口时不指定模型，将使用此默认模型。
      </p>

      <div className="space-y-2">
        {allModels.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            暂无可用模型，请先添加提供商并获取模型列表
          </p>
        ) : (
          <select
            value={defaultModelId || ''}
            onChange={(e) => handleSetDefaultModel(Number(e.target.value))}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          >
            <option value="">请选择默认模型</option>
            {allModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.providerName} - {model.displayName}
              </option>
            ))}
          </select>
        )}

        {defaultModelId && (
          <>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ✓ 当前默认模型：
                {allModels.find(m => m.id === defaultModelId)?.providerName} -
                {allModels.find(m => m.id === defaultModelId)?.displayName}
              </p>
            </div>

            <button
              onClick={handleTestDefaultModel}
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium mt-3"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  测试默认模型连接
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// 前端调用说明组件
function UsageGuide() {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'scenarios'>('basic');

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold mb-4">前端调用说明</h3>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-4 border-b border-border">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'basic'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          基础用法
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'advanced'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          高级用法
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'scenarios'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          实际应用
        </button>
      </div>

      {/* 基础用法 */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">1. 使用默认模型</h4>
            <p className="text-sm text-muted-foreground mb-2">
              调用 AI 接口时不指定模型，将自动使用全局默认模型：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: '你是一个有帮助的助手' },
      { role: 'user', content: '你好，介绍一下自己' }
    ]
  })
});

const data = await response.json();
console.log(data.content); // AI 的回复`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">2. 在 React 组件中使用</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { useState } from 'react';

function ChatComponent() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: '你好' }
          ]
        })
      });

      const data = await res.json();
      setResponse(data.content);
    } catch (error) {
      console.error('AI 调用失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleChat} disabled={loading}>
        {loading ? '思考中...' : '发送消息'}
      </button>
      <p>{response}</p>
    </div>
  );
}`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">3. 响应格式</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "content": "你好！我是一个 AI 助手...",
  "model": "gpt-4",
  "usage": {
    "promptTokens": 20,
    "completionTokens": 50,
    "totalTokens": 70
  }
}`}</pre>
          </div>
        </div>
      )}

      {/* 高级用法 */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">1. 指定提供商和模型</h4>
            <p className="text-sm text-muted-foreground mb-2">
              可以指定使用特定的提供商和模型：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    providerId: 1,  // 提供商 ID
    modelId: 'gpt-4',  // 模型 ID
    messages: [
      { role: 'user', content: '你好' }
    ]
  })
});`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">2. 设置温度和最大 Token</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '写一首诗' }
    ],
    temperature: 0.8,  // 创造性 (0-1)
    maxTokens: 1000    // 最大输出长度
  })
});`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">3. 多轮对话</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: '你是一个编程助手' },
      { role: 'user', content: '如何使用 React Hooks？' },
      { role: 'assistant', content: 'React Hooks 是...' },
      { role: 'user', content: '能举个例子吗？' }
    ]
  })
});`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">4. 错误处理</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`try {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '你好' }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '请求失败');
  }

  const data = await response.json();
  console.log(data.content);
} catch (error) {
  console.error('AI 调用失败:', error.message);
  // 显示错误提示给用户
}`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">5. 在服务端使用</h4>
            <p className="text-sm text-muted-foreground mb-2">
              在 Next.js API 路由或服务端组件中使用：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { getDefaultAIService } from '@/lib/ai/service';

// 在 API 路由中
export async function POST(request: Request) {
  const aiService = await getDefaultAIService();

  const response = await aiService.chat([
    { role: 'user', content: '你好' }
  ]);

  return Response.json({ content: response.content });
}`}</pre>
          </div>
        </div>
      )}

      {/* 实际应用场景 */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">1. 在小工具中调用 AI</h4>
            <p className="text-sm text-muted-foreground mb-2">
              在在线工具中集成 AI 功能，例如智能文本处理、代码生成等：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// 在小工具的 HTML/JavaScript 代码中
async function processWithAI(userInput) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是一个文本处理助手，帮助用户优化和改进文本'
          },
          {
            role: 'user',
            content: '请帮我优化以下文本：' + userInput
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('AI 处理失败');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('AI 调用错误:', error);
    return '处理失败，请稍后重试';
  }
}

// 使用示例
document.getElementById('processBtn').addEventListener('click', async () => {
  const input = document.getElementById('inputText').value;
  const output = document.getElementById('outputText');

  output.textContent = '处理中...';
  const result = await processWithAI(input);
  output.textContent = result;
});`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">2. 在网址推荐中调用 AI</h4>
            <p className="text-sm text-muted-foreground mb-2">
              使用 AI 智能推荐相关网站，增强用户体验：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// 在网址推荐功能中使用
async function getAIRecommendations(keyword, category) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: \`你是一个专业的网站推荐专家。
请根据用户的关键词推荐5个优质网站。
返回格式为 JSON 数组，每个网站包含：
- title: 网站标题
- url: 网站地址
- description: 简短描述（50字以内）
- tags: 相关标签数组\`
          },
          {
            role: 'user',
            content: \`关键词：\${keyword}，分类：\${category}\`
          }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    // 解析 AI 返回的 JSON
    const recommendations = JSON.parse(data.content);
    return recommendations;
  } catch (error) {
    console.error('获取推荐失败:', error);
    return [];
  }
}

// 使用示例
const recommendations = await getAIRecommendations('编程学习', '技术');
console.log(recommendations);
// [
//   {
//     title: "MDN Web Docs",
//     url: "https://developer.mozilla.org",
//     description: "权威的 Web 技术文档和学习资源",
//     tags: ["前端", "文档", "教程"]
//   },
//   ...
// ]`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">3. 智能搜索增强</h4>
            <p className="text-sm text-muted-foreground mb-2">
              理解用户搜索意图，提供更精准的结果：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`async function enhanceSearch(searchQuery, existingSites) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是一个搜索意图分析助手，帮助理解用户搜索意图'
          },
          {
            role: 'user',
            content: \`用户搜索："\${searchQuery}"
现有网站：\${JSON.stringify(existingSites)}
请分析用户意图并推荐最相关的网站\`
          }
        ]
      })
    });

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('搜索增强失败:', error);
    return null;
  }
}`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">4. 工具代码生成</h4>
            <p className="text-sm text-muted-foreground mb-2">
              使用 AI 自动生成小工具代码：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`async function generateToolCode(toolDescription) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: \`你是一个前端工具代码生成器。
生成完整的 HTML/CSS/JavaScript 代码，包含：
1. 美观的界面设计
2. 完整的功能实现
3. 错误处理
4. 响应式布局\`
          },
          {
            role: 'user',
            content: \`请生成一个工具：\${toolDescription}\`
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      })
    });

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('代码生成失败:', error);
    return null;
  }
}

// 使用示例
const toolCode = await generateToolCode('JSON 格式化和验证工具');
// 返回完整的 HTML 代码，可直接在工具编辑器中使用`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">5. 内容摘要生成</h4>
            <p className="text-sm text-muted-foreground mb-2">
              为网站描述生成简洁的摘要：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`async function generateSummary(longDescription) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是一个内容摘要专家，将长文本压缩为简洁的描述'
          },
          {
            role: 'user',
            content: \`请将以下内容压缩为50字以内的摘要：\${longDescription}\`
          }
        ],
        temperature: 0.5,
        maxTokens: 100
      })
    });

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('摘要生成失败:', error);
    return longDescription.substring(0, 50) + '...';
  }
}`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">6. 标签自动生成</h4>
            <p className="text-sm text-muted-foreground mb-2">
              根据网站内容自动生成相关标签：
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`async function generateTags(siteTitle, siteDescription) {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: \`你是一个标签生成助手。
根据网站信息生成3-5个相关标签。
只返回标签数组，格式：["标签1", "标签2", "标签3"]\`
          },
          {
            role: 'user',
            content: \`网站：\${siteTitle}
描述：\${siteDescription}\`
          }
        ],
        temperature: 0.6
      })
    });

    const data = await response.json();
    const tags = JSON.parse(data.content);
    return tags;
  } catch (error) {
    console.error('标签生成失败:', error);
    return [];
  }
}

// 使用示例
const tags = await generateTags(
  'GitHub',
  '全球最大的代码托管平台'
);
// 返回: ["开发工具", "代码托管", "开源", "协作"]`}</pre>
          </div>
        </div>
      )}

      {/* 注意事项 */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ 注意事项
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
          <li>API 调用需要管理员认证（已登录管理后台）</li>
          <li>请合理控制请求频率，避免超出 API 配额</li>
          <li>建议在生产环境中添加速率限制</li>
          <li>敏感信息不要通过 AI 接口传输</li>
          <li>不同模型的响应时间和质量可能有差异</li>
        </ul>
      </div>
    </div>
  );
}
