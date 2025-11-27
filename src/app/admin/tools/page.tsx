'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { Tool, ToolCategory } from '@prisma/client';
import ToolEditor from '@/components/ToolEditor';
import EnhancedToolEditor from '@/components/EnhancedToolEditor';

export default function ToolsManagementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<(ToolCategory & { tools: Tool[] })[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ToolCategory | null>(null);
  const [editingTool, setEditingTool] = useState<(Tool & { category?: ToolCategory }) | undefined>(undefined);
  const [categoryForm, setCategoryForm] = useState({ name: '', sortOrder: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    code: '',
    icon: '',
    categoryId: 0,
    sortOrder: 0
  });

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    try {
      await axios.get('/api/auth/check');
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/tools/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await axios.put('/api/tools/categories', { id: editingCategory.id, ...categoryForm });
      } else {
        await axios.post('/api/tools/categories', categoryForm);
      }
      fetchCategories();
      setShowCategoryModal(false);
      setCategoryForm({ name: '', sortOrder: 0 });
      setEditingCategory(null);
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定删除此分类？分类下的所有工具也会被删除。')) return;
    try {
      await axios.delete(`/api/tools/categories?id=${id}`);
      fetchCategories();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleSaveTool = async () => {
    try {
      if (editingTool) {
        await axios.put('/api/tools', { id: editingTool.id, ...toolForm });
      } else {
        await axios.post('/api/tools', toolForm);
      }
      fetchCategories();
      setShowToolModal(false);
      setToolForm({ name: '', description: '', code: '', icon: '', categoryId: 0, sortOrder: 0 });
      setEditingTool(undefined);
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleDeleteTool = async (id: number) => {
    if (!confirm('确定删除此工具？')) return;
    try {
      await axios.delete(`/api/tools?id=${id}`);
      fetchCategories();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleImportDefaults = async () => {
    const totalTools = categories.reduce((sum, cat) => sum + cat.tools.length, 0);

    if (totalTools > 0) {
      if (!confirm(`当前已有 ${categories.length} 个分类和 ${totalTools} 个工具。\n\n导入内置工具需要先清空所有现有工具。\n\n是否继续？`)) {
        return;
      }
    } else {
      if (!confirm('确定要导入内置工具吗？\n\n将导入 4 个分类和 9 个实用工具。')) {
        return;
      }
    }

    setIsImporting(true);
    try {
      const response = await axios.post('/api/tools/import-defaults');
      alert(`✅ ${response.data.message}`);
      fetchCategories();
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert('❌ 导入失败，请查看控制台了解详情');
        console.error('导入失败:', error);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const openCategoryModal = (category?: ToolCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, sortOrder: category.sortOrder });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', sortOrder: 0 });
    }
    setShowCategoryModal(true);
  };

  const openToolModal = (tool?: Tool, categoryId?: number) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm({
        name: tool.name,
        description: tool.description || '',
        code: tool.code,
        icon: tool.icon || '',
        categoryId: tool.categoryId,
        sortOrder: tool.sortOrder
      });
    } else {
      setEditingTool(undefined);
      setToolForm({
        name: '',
        description: '',
        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新工具</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      background-color: #f4f4f5;
      color: #18181b;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    /* 在这里添加你的CSS样式 */
  </style>
</head>
<body>
  <div class="container">
    <h1>我的工具</h1>
    <!-- 在这里添加你的HTML内容 -->
  </div>
  
  <script>
    // 在这里添加你的JavaScript代码
    console.log('工具已加载');
  </script>
</body>
</html>`,
        icon: '🔧',
        categoryId: categoryId || categories[0]?.id || 0,
        sortOrder: 0
      });
    }
    setShowToolModal(true);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">工具管理</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleImportDefaults}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isImporting ? '导入中...' : '导入内置工具'}
            </button>
            <button
              onClick={() => openCategoryModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> 添加分类
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openToolModal(undefined, category.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" /> 添加工具
                  </button>
                  <button
                    onClick={() => openCategoryModal(category)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map((tool) => (
                  <div key={tool.id} className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {tool.icon && <span className="text-xl">{tool.icon}</span>}
                        <h3 className="font-semibold text-foreground">{tool.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openToolModal(tool)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTool(tool.id)}
                          className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {tool.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                    )}
                  </div>
                ))}
                {category.tools.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">暂无工具</p>
                )}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              暂无分类，请先添加分类
            </div>
          )}
        </div>
      </div>

      {/* 分类模态框 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full border border-border">
            <h3 className="text-xl font-bold mb-4">{editingCategory ? '编辑分类' : '添加分类'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">分类名称</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="输入分类名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">排序</label>
                <input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 工具模态框 */}
      {showToolModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-xl max-w-7xl w-full border border-border my-8 max-h-[90vh] overflow-y-auto">
            <EnhancedToolEditor
              tool={editingTool}
              categories={categories}
              onSave={async (data: any) => {
                try {
                  if (editingTool) {
                    await axios.put('/api/tools', { id: editingTool.id, ...data });
                  } else {
                    await axios.post('/api/tools', data);
                  }
                  fetchCategories();
                  setShowToolModal(false);
                  setEditingTool(undefined);
                } catch (error) {
                  alert('操作失败');
                }
              }}
              onCancel={() => {
                setShowToolModal(false);
                setEditingTool(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
