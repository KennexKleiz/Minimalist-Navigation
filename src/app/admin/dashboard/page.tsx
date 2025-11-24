'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Plus, Trash2, Save, Sparkles, LogOut, Settings, Layout, Globe, Edit, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ToastContainer, ToastProps } from '@/components/Toast';

// Types (Simplified for brevity, ideally shared)
interface Site {
  id?: number;
  title: string;
  url: string;
  description: string;
  icon: string;
}

interface Section {
  id?: number;
  name: string;
  sites: Site[];
}

interface Category {
  id?: number;
  name: string;
  sections: Section[];
}

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState({ title: '', subtitle: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'password'>('content');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'section' | 'site' | null>(null);
  const [modalData, setModalData] = useState<any>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, configRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/config')
      ]);
      setCategories(catsRes.data);
      setConfig(configRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      // Simple auth check failure handling
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await axios.delete('/api/auth/login');
    router.push('/admin/login');
  };

  const handleSaveConfig = async () => {
    try {
      await axios.put('/api/config', config);
      showToast('设置已保存', 'success');
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('两次输入的新密码不一致', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('新密码至少需要6个字符', 'error');
      return;
    }

    try {
      await axios.post('/api/auth/change-password', {
        username: 'admin',
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('密码修改成功', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.response?.data?.error || '密码修改失败', 'error');
    }
  };

  const handleDelete = async (type: 'category' | 'section' | 'site', id?: number) => {
    if (!id) return;

    if (!confirm(`确定要删除这个${type === 'category' ? '分类' : type === 'section' ? '板块' : '网站'}吗？`)) {
      return;
    }

    try {
      const endpoint = type === 'category' ? 'categories' : type === 'section' ? 'sections' : 'sites';
      await axios.delete(`/api/${endpoint}?id=${id}`);
      showToast('删除成功', 'success');
      fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('删除失败', 'error');
    }
  };

  // Simplified CMS Logic (In a real app, this would be more robust with separate components)
  // For this demo, we'll focus on the structure and AI Magic Fill

  const handleMagicFill = async (categoryIndex: number, sectionIndex: number) => {
    const sectionName = categories[categoryIndex].sections[sectionIndex].name;
    if (!sectionName) return showToast('请先输入版块名称', 'warning');

    const newCategories = [...categories];
    // Show loading state for this specific button ideally

    try {
      const res = await axios.post('/api/ai/recommend', {
        query: sectionName,
        type: 'magic_fill'
      });

      const recommendedSites = res.data.sites;
      newCategories[categoryIndex].sections[sectionIndex].sites.push(...recommendedSites);
      setCategories(newCategories);
      showToast('AI 推荐填充成功！', 'success');
    } catch (error) {
      showToast('AI 填充失败，请检查 API Key', 'error');
    }
  };

  const openModal = (type: 'category' | 'section' | 'site', data: any = {}, editMode: boolean = false) => {
    setModalType(type);
    setModalData(data);
    setIsEditMode(editMode);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isEditMode) {
        // 编辑模式
        if (modalType === 'category') {
          await axios.put(`/api/categories?id=${modalData.id}`, { name: data.name });
        } else if (modalType === 'section') {
          await axios.put(`/api/sections?id=${modalData.id}`, {
            name: data.name,
            password: data.password || null // 如果为空字符串，则清除密码
          });
        } else if (modalType === 'site') {
          await axios.put(`/api/sites?id=${modalData.id}`, {
            title: data.title,
            url: data.url,
            description: data.description,
            icon: data.icon
          });
        }
        showToast('更新成功', 'success');
      } else {
        // 新建模式
        if (modalType === 'category') {
          await axios.post('/api/categories', { name: data.name });
        } else if (modalType === 'section') {
          await axios.post('/api/sections', {
            name: data.name,
            categoryId: modalData.categoryId,
            password: data.password || null
          });
        } else if (modalType === 'site') {
          await axios.post('/api/sites', {
            title: data.title,
            url: data.url,
            description: data.description,
            icon: data.icon,
            sectionId: modalData.sectionId
          });
        }
        showToast('创建成功', 'success');
      }
      setModalOpen(false);
      setIsEditMode(false);
      fetchData();
    } catch (error) {
      console.error('Operation failed:', error);
      showToast('操作失败', 'error');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">A</div>
          <span className="font-bold text-lg">管理后台</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'content' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Layout className="w-4 h-4" /> 内容管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Settings className="w-4 h-4" /> 全局设置
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'password' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Save className="w-4 h-4" /> 修改密码
          </button>
        </nav>

        <div className="space-y-2 mt-auto">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> 查看首页
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'settings' ? (
          <div className="max-w-2xl bg-card p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6">全局设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">网站标题</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">副标题</label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                />
              </div>
              <button onClick={handleSaveConfig} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> 保存更改
              </button>
            </div>
          </div>
        ) : activeTab === 'password' ? (
          <div className="max-w-2xl bg-card p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6">修改密码</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">旧密码</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">新密码</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">密码至少需要6个字符</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">确认新密码</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> 修改密码
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">内容管理</h2>
              <button
                onClick={() => openModal('category')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> 新建分类
              </button>
            </div>

            {/* Categories List */}
            <div className="space-y-6">
              {categories.map((category, catIdx) => (
                <div key={category.id || catIdx} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('section', { categoryId: category.id })}
                        className="p-1 hover:bg-muted rounded"
                        title="新建版块"
                        disabled={!category.id}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal('category', category, true)}
                        className="p-1 hover:bg-muted rounded text-primary"
                        disabled={!category.id}
                        title="编辑分类"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('category', category.id)}
                        className="p-1 hover:bg-muted rounded text-red-500"
                        disabled={!category.id}
                        title="删除分类"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {category.sections.map((section, secIdx) => (
                      <div key={section.id || secIdx} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{section.name}</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {section.sites.length} 个站点
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal('site', { sectionId: section.id })}
                              className="text-xs flex items-center gap-1 text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                              disabled={!section.id}
                            >
                              <Plus className="w-3 h-3" /> 新建网址
                            </button>
                            <button
                              onClick={() => handleMagicFill(catIdx, secIdx)}
                              className="text-xs flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                            >
                              <Sparkles className="w-3 h-3" /> AI 智能填充
                            </button>
                            <button
                              onClick={() => openModal('section', section, true)}
                              className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              disabled={!section.id}
                            >
                              <Edit className="w-3 h-3" /> 编辑板块
                            </button>
                            <button
                              onClick={() => handleDelete('section', section.id)}
                              className="text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              disabled={!section.id}
                            >
                              <Trash2 className="w-3 h-3" /> 删除板块
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {section.sites.map((site, siteIdx) => (
                            <div key={site.id || siteIdx} className="flex items-center gap-3 p-2 bg-muted/30 rounded border border-border/50 group">
                              <div className="w-8 h-8 bg-background rounded flex items-center justify-center text-xs border border-border">
                                {site.icon ? <img src={site.icon} className="w-full h-full object-contain rounded" /> : <Globe className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{site.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{site.url}</div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openModal('site', site, true)}
                                  className="p-1 hover:bg-primary/10 rounded text-primary"
                                  disabled={!site.id}
                                  title="编辑"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete('site', site.id)}
                                  className="p-1 hover:bg-red-50 rounded text-red-500"
                                  disabled={!site.id}
                                  title="删除"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {isEditMode ? (
                <>
                  {modalType === 'category' && '编辑分类'}
                  {modalType === 'section' && '编辑版块'}
                  {modalType === 'site' && '编辑网址'}
                </>
              ) : (
                <>
                  {modalType === 'category' && '新建分类'}
                  {modalType === 'section' && '新建版块'}
                  {modalType === 'site' && '新建网址'}
                </>
              )}
            </h3>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {(modalType === 'category' || modalType === 'section') && (
                <div>
                  <label className="block text-sm font-medium mb-1">名称</label>
                  <input
                    name="name"
                    required
                    defaultValue={isEditMode ? modalData.name : ''}
                    className="w-full p-2 border border-border rounded-lg bg-background"
                    autoFocus
                  />
                </div>
              )}
              {modalType === 'section' && (
                <div>
                  <label className="block text-sm font-medium mb-1">访问密码（可选）</label>
                  <input
                    name="password"
                    type="text"
                    placeholder="留空则不设置密码"
                    defaultValue={isEditMode ? modalData.password : ''}
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">设置密码后，前台访问该板块需要输入密码</p>
                </div>
              )}
              {modalType === 'site' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">标题</label>
                    <input
                      name="title"
                      required
                      defaultValue={isEditMode ? modalData.title : ''}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">链接</label>
                    <input
                      name="url"
                      required
                      type="url"
                      defaultValue={isEditMode ? modalData.url : ''}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">描述</label>
                    <textarea
                      name="description"
                      defaultValue={isEditMode ? modalData.description : ''}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">图标链接（可选）</label>
                    <input
                      name="icon"
                      type="url"
                      defaultValue={isEditMode ? modalData.icon : ''}
                      placeholder="https://example.com/favicon.ico"
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 hover:bg-muted rounded-lg"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  {isEditMode ? '保存' : '确定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}