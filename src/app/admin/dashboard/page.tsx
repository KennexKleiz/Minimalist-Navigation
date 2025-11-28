'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Plus, Trash2, Save, Sparkles, LogOut, Settings, Layout, Globe, Edit, ExternalLink, FileText, Tag as TagIcon, Database, Upload, Download, RefreshCw, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ToastContainer, ToastProps } from '@/components/Toast';
import AIConfigPanel from '@/components/admin/AIConfigPanel';

// Types (Simplified for brevity, ideally shared)
interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Site {
  id?: number;
  title: string;
  url: string;
  description: string;
  icon: string;
  sortOrder?: number;
  badge?: string;
  tags?: Tag[];
}

interface Section {
  id?: number;
  name: string;
  sites: Site[];
  password?: string | null;
  sortOrder?: number;
}

interface Category {
  id?: number;
  name: string;
  sections: Section[];
  sortOrder?: number;
}

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [config, setConfig] = useState({
    title: '',
    subtitle: '',
    gridColumns: 4,
    truncateDescription: true,
    containerMaxWidth: '1440px',
    favicon: '',
    logo: '',
    backgroundImage: '',
    backgroundImages: '[]',
    backgroundMode: 'fixed',
    footerHtml: '',
    webdavUrl: '',
    webdavUsername: '',
    webdavPassword: '',
    siteTitleFontSize: 16,
    siteDescriptionFontSize: 12,
    showDescriptionOnHover: true,
    showTools: false,
    showToolRankings: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'password' | 'tags' | 'tools' | 'backup' | 'ai-config'>('content');
  const [webdavBackups, setWebdavBackups] = useState<any[]>([]);
  const [webdavLoading, setWebdavLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'section' | 'site' | 'batch_import' | 'tag' | null>(null);
  const [modalData, setModalData] = useState<any>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const router = useRouter();

  // 根据字符串生成固定的渐变色
  const getGradientColor = (str: string) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-yellow-400 to-orange-500',
      'from-pink-400 to-rose-500',
      'from-indigo-400 to-cyan-500',
      'from-teal-400 to-emerald-500',
      'from-red-400 to-pink-600'
    ];
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

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
      const [catsRes, configRes, tagsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/config'),
        axios.get('/api/tags')
      ]);
      setCategories(catsRes.data);
      setTags(tagsRes.data);
      if (catsRes.data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(catsRes.data[0].id || null);
      }
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

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/backup/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = res.headers['content-disposition'];
      let filename = 'daohang-backup.json';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) filename = filenameMatch[1];
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('导出成功', 'success');
    } catch (error) {
      showToast('导出失败', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        const data = JSON.parse(content as string);
        await axios.post('/api/backup/import', data);
        showToast('导入成功，页面即将刷新', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error(error);
        showToast('导入失败，请检查文件格式', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleWebDAVTest = async () => {
    setWebdavLoading(true);
    try {
      // 先保存配置
      await axios.put('/api/config', config);
      await axios.post('/api/backup/webdav', { action: 'test' });
      showToast('WebDAV 连接成功', 'success');
      fetchWebDAVBackups();
    } catch (error) {
      showToast('WebDAV 连接失败', 'error');
    } finally {
      setWebdavLoading(false);
    }
  };

  const fetchWebDAVBackups = async () => {
    setWebdavLoading(true);
    try {
      const res = await axios.post('/api/backup/webdav', { action: 'list' });
      setWebdavBackups(res.data.backups);
    } catch (error) {
      console.error(error);
    } finally {
      setWebdavLoading(false);
    }
  };

  const handleWebDAVUpload = async () => {
    setWebdavLoading(true);
    try {
      await axios.post('/api/backup/webdav', { action: 'upload' });
      showToast('备份上传成功', 'success');
      fetchWebDAVBackups();
    } catch (error) {
      showToast('备份上传失败', 'error');
    } finally {
      setWebdavLoading(false);
    }
  };

  const handleWebDAVRestore = async (filename: string) => {
    if (!confirm('确定要从该备份恢复吗？这将覆盖当前所有数据！')) return;
    
    setWebdavLoading(true);
    try {
      const res = await axios.post('/api/backup/webdav', { action: 'download', filename });
      await axios.post('/api/backup/import', res.data.content);
      showToast('恢复成功，页面即将刷新', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      showToast('恢复失败', 'error');
    } finally {
      setWebdavLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'favicon' | 'logo' | 'backgroundImage' | 'backgroundImages') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (field === 'backgroundImages') {
        const currentImages = JSON.parse(config.backgroundImages || '[]');
        const newImages = [...currentImages, res.data.url];
        setConfig(prev => ({ ...prev, backgroundImages: JSON.stringify(newImages) }));
      } else {
        setConfig(prev => ({ ...prev, [field]: res.data.url }));
      }
      
      showToast('上传成功', 'success');
    } catch (error) {
      console.error('Upload failed', error);
      showToast('上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeBackgroundImage = (index: number) => {
    const currentImages = JSON.parse(config.backgroundImages || '[]');
    const newImages = currentImages.filter((_: any, i: number) => i !== index);
    setConfig(prev => ({ ...prev, backgroundImages: JSON.stringify(newImages) }));
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

  const openModal = (type: 'category' | 'section' | 'site' | 'batch_import' | 'tag', data: any = {}, editMode: boolean = false) => {
    setModalType(type);
    setModalData(data);
    setIsEditMode(editMode);
    if (type === 'site' && data.tags) {
      setSelectedTagIds(data.tags.map((t: Tag) => t.id));
    } else {
      setSelectedTagIds([]);
    }
    setModalOpen(true);
  };

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // 更新 input 值
      const iconInput = document.querySelector('input[name="icon"]') as HTMLInputElement;
      if (iconInput) {
        iconInput.value = res.data.url;
        // 触发 change 事件以防有监听器（虽然这里没有）
        iconInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      showToast('图标上传成功', 'success');
    } catch (error) {
      console.error('Upload failed', error);
      showToast('上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isEditMode) {
        // 编辑模式
        if (modalType === 'category') {
          await axios.put(`/api/categories?id=${modalData.id}`, {
            name: data.name,
            sortOrder: parseInt(data.sortOrder as string)
          });
        } else if (modalType === 'section') {
          await axios.put(`/api/sections?id=${modalData.id}`, {
            name: data.name,
            sortOrder: parseInt(data.sortOrder as string),
            password: data.password || null // 如果为空字符串，则清除密码
          });
        } else if (modalType === 'site') {
          await axios.put(`/api/sites?id=${modalData.id}`, {
            title: data.title,
            url: data.url,
            description: data.description,
            icon: data.icon,
            sortOrder: parseInt(data.sortOrder as string),
            badge: data.badge,
            tagIds: selectedTagIds
          });
        } else if (modalType === 'tag') {
          await axios.put(`/api/tags?id=${modalData.id}`, {
            name: data.name,
            color: data.color
          });
        }
        showToast('更新成功', 'success');
      } else {
        // 新建模式
        if (modalType === 'category') {
          await axios.post('/api/categories', {
            name: data.name,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder as string) : undefined
          });
        } else if (modalType === 'section') {
          await axios.post('/api/sections', {
            name: data.name,
            categoryId: modalData.categoryId,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder as string) : undefined,
            password: data.password || null
          });
        } else if (modalType === 'site') {
          await axios.post('/api/sites', {
            title: data.title,
            url: data.url,
            description: data.description,
            icon: data.icon,
            sectionId: modalData.sectionId,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder as string) : undefined,
            badge: data.badge,
            tagIds: selectedTagIds
          });
        } else if (modalType === 'tag') {
          await axios.post('/api/tags', {
            name: data.name,
            color: data.color
          });
        } else if (modalType === 'batch_import') {
          const content = data.content as string;
          const lines = content.split('\n').filter(line => line.trim());
          const sites = lines.map(line => {
            const [title, url, description, icon] = line.split('|').map(s => s.trim());
            return { title, url, description, icon };
          });

          if (sites.length === 0) {
            showToast('请输入有效的数据', 'warning');
            return;
          }

          await axios.post('/api/sites/batch', {
            sectionId: modalData.sectionId,
            sites
          });
          showToast(`成功导入 ${sites.length} 个网站`, 'success');
        }
        if (modalType !== 'batch_import') {
          showToast('创建成功', 'success');
        }
      }
      setModalOpen(false);
      setIsEditMode(false);
      fetchData();
    } catch (error) {
      console.error('Operation failed:', error);
      showToast('操作失败', 'error');
    }
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
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
            onClick={() => setActiveTab('tags')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'tags' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <TagIcon className="w-4 h-4" /> 标签管理
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'tools' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Settings className="w-4 h-4" /> 工具管理
          </button>
          <button
            onClick={() => setActiveTab('ai-config')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'ai-config' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Brain className="w-4 h-4" /> AI 配置
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
          <button
            onClick={() => {
              setActiveTab('backup');
              if (config.webdavUrl) fetchWebDAVBackups();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'backup' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Database className="w-4 h-4" /> 备份恢复
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">分类页每行显示数量</label>
                  <select
                    value={config.gridColumns}
                    onChange={(e) => setConfig({ ...config, gridColumns: parseInt(e.target.value) })}
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  >
                    <option value={3}>3个</option>
                    <option value={4}>4个</option>
                    <option value={5}>5个</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">分类页最大宽度</label>
                  <input
                    type="text"
                    value={config.containerMaxWidth}
                    onChange={(e) => setConfig({ ...config, containerMaxWidth: e.target.value })}
                    placeholder="例如: 1440px 或 100%"
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">网站标题字体大小 (px)</label>
                  <input
                    type="number"
                    value={config.siteTitleFontSize}
                    onChange={(e) => setConfig({ ...config, siteTitleFontSize: parseInt(e.target.value) })}
                    placeholder="默认: 16"
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">网站描述字体大小 (px)</label>
                  <input
                    type="number"
                    value={config.siteDescriptionFontSize}
                    onChange={(e) => setConfig({ ...config, siteDescriptionFontSize: parseInt(e.target.value) })}
                    placeholder="默认: 12"
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="truncateDescription"
                    checked={config.truncateDescription}
                    onChange={(e) => setConfig({ ...config, truncateDescription: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="truncateDescription" className="text-sm font-medium">
                    描述只显示一行（多余截断）
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showDescriptionOnHover"
                    checked={config.showDescriptionOnHover}
                    onChange={(e) => setConfig({ ...config, showDescriptionOnHover: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="showDescriptionOnHover" className="text-sm font-medium">
                    鼠标悬停时显示完整描述
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showTools"
                    checked={config.showTools}
                    onChange={(e) => setConfig({ ...config, showTools: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="showTools" className="text-sm font-medium">
                    显示在线工具入口
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showToolRankings"
                    checked={config.showToolRankings}
                    onChange={(e) => setConfig({ ...config, showToolRankings: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="showToolRankings" className="text-sm font-medium">
                    显示首页小工具排行榜
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium mb-2">网站 Favicon 图标</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                      {config.favicon ? (
                        <img src={config.favicon} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <Globe className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.favicon || ''}
                        onChange={(e) => setConfig({ ...config, favicon: e.target.value })}
                        placeholder="输入图片链接或上传"
                        className="w-full p-2 border border-border rounded-lg bg-background text-sm mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'favicon')}
                        className="text-sm text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">网站 Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                      {config.logo ? (
                        <img src={config.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Layout className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.logo || ''}
                        onChange={(e) => setConfig({ ...config, logo: e.target.value })}
                        placeholder="输入图片链接或上传"
                        className="w-full p-2 border border-border rounded-lg bg-background text-sm mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        className="text-sm text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-2">首页背景图设置</label>
                  
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-2 block">显示模式</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="backgroundMode"
                          value="fixed"
                          checked={config.backgroundMode === 'fixed'}
                          onChange={(e) => setConfig({ ...config, backgroundMode: e.target.value })}
                          className="rounded-full border-border"
                        />
                        <span className="text-sm">固定一张</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="backgroundMode"
                          value="random"
                          checked={config.backgroundMode === 'random'}
                          onChange={(e) => setConfig({ ...config, backgroundMode: e.target.value })}
                          className="rounded-full border-border"
                        />
                        <span className="text-sm">每次刷新随机</span>
                      </label>
                    </div>
                  </div>

                  {config.backgroundMode === 'fixed' ? (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 border border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                        {config.backgroundImage ? (
                          <img src={config.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                        ) : (
                          <Layout className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={config.backgroundImage || ''}
                          onChange={(e) => setConfig({ ...config, backgroundImage: e.target.value })}
                          placeholder="输入图片链接或上传"
                          className="w-full p-2 border border-border rounded-lg bg-background text-sm mb-2"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                          className="text-sm text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {JSON.parse(config.backgroundImages || '[]').map((url: string, index: number) => (
                          <div key={index} className="relative group aspect-video border border-border rounded-lg overflow-hidden bg-muted/30">
                            <img src={url} alt={`Background ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeBackgroundImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="删除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-video border border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors">
                          <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">添加图片</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'backgroundImages')}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">上传多张图片，每次刷新页面将随机显示其中一张。</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium mb-1">底部自定义代码 (HTML)</label>
                <textarea
                  value={config.footerHtml || ''}
                  onChange={(e) => setConfig({ ...config, footerHtml: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg bg-background font-mono text-sm h-32"
                  placeholder="例如: 备案号、统计代码等"
                />
                <p className="text-xs text-muted-foreground mt-1">支持 HTML 标签，将显示在页面最底部。</p>
              </div>

              <button onClick={handleSaveConfig} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 mt-4">
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
        ) : activeTab === 'backup' ? (
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" /> 本地备份与恢复
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" /> 导出配置文件
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" /> 导入配置文件
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                导出文件包含所有网站配置、分类、标签及全局设置。导入时将覆盖当前所有数据，请谨慎操作。
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" /> WebDAV 云备份
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">WebDAV 地址</label>
                  <input
                    type="text"
                    value={config.webdavUrl || ''}
                    onChange={(e) => setConfig({ ...config, webdavUrl: e.target.value })}
                    placeholder="https://dav.example.com/dav/"
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">用户名</label>
                    <input
                      type="text"
                      value={config.webdavUsername || ''}
                      onChange={(e) => setConfig({ ...config, webdavUsername: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">密码</label>
                    <input
                      type="password"
                      value={config.webdavPassword || ''}
                      onChange={(e) => setConfig({ ...config, webdavPassword: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleWebDAVTest}
                    disabled={webdavLoading}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    {webdavLoading ? '连接中...' : '保存并测试连接'}
                  </button>
                  <button
                    onClick={handleWebDAVUpload}
                    disabled={webdavLoading || !config.webdavUrl}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> 立即备份到云端
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">云端备份列表</h3>
                  <button
                    onClick={fetchWebDAVBackups}
                    disabled={webdavLoading || !config.webdavUrl}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="刷新列表"
                  >
                    <RefreshCw className={`w-4 h-4 ${webdavLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {webdavBackups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
                    {config.webdavUrl ? '暂无备份文件' : '请先配置 WebDAV'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {webdavBackups.map((backup) => (
                      <div key={backup.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div>
                          <div className="font-medium text-sm">{backup.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(backup.lastMod).toLocaleString()} · {(backup.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                        <button
                          onClick={() => handleWebDAVRestore(backup.name)}
                          disabled={webdavLoading}
                          className="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                        >
                          恢复
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'tags' ? (
          <div className="max-w-4xl bg-card p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">标签管理</h2>
              <button
                onClick={() => openModal('tag')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> 新建标签
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <div key={tag.id} className="p-4 border border-border rounded-lg flex items-center justify-between bg-background">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${tag.color}-500`} style={{ backgroundColor: tag.color }} />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal('tag', tag, true)}
                      className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('确定要删除这个标签吗？')) {
                          await axios.delete(`/api/tags?id=${tag.id}`);
                          showToast('删除成功', 'success');
                          fetchData();
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {tags.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                  <p>暂无标签，请点击右上角新建</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'tools' ? (
          <iframe
            src="/admin/tools"
            className="w-full h-[calc(100vh-120px)] border-0 rounded-xl bg-background"
            title="工具管理"
          />
        ) : activeTab === 'ai-config' ? (
          <div className="max-w-6xl">
            <AIConfigPanel showToast={showToast} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">内容管理</h2>
            </div>

            {/* Categories Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 border-b border-border no-scrollbar">
              <button
                onClick={() => openModal('category')}
                className="shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> 新建分类
              </button>
              <div className="w-px h-6 bg-border mx-2 shrink-0" />
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id || null)}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                    selectedCategoryId === category.id
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                      : 'bg-card hover:bg-muted text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Selected Category Content */}
            <div className="space-y-6">
              {categories.map((category, catIdx) => {
                if (category.id !== selectedCategoryId) return null;
                
                return (
                  <div key={category.id || catIdx} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border border-border">
                          {category.sections.length} 个板块
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('section', { categoryId: category.id })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                          title="新建版块"
                          disabled={!category.id}
                        >
                          <Plus className="w-3.5 h-3.5" /> 新建板块
                        </button>
                        <button
                          onClick={() => openModal('category', category, true)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                          disabled={!category.id}
                          title="编辑分类"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('category', category.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                          disabled={!category.id}
                          title="删除分类"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {category.sections.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                          <p>暂无板块，请点击右上角新建</p>
                        </div>
                      ) : (
                        category.sections.map((section, secIdx) => (
                          <div key={section.id || secIdx} className="border border-border rounded-xl p-5 bg-background/50 hover:border-primary/20 transition-colors">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-base">{section.name}</span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                                  排序: {section.sortOrder}
                                </span>
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
                                  {section.sites.length} 个站点
                                </span>
                                {section.password && (
                                  <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                    密码保护
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openModal('site', { sectionId: section.id })}
                                  className="text-xs flex items-center gap-1 text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-md transition-colors font-medium"
                                  disabled={!section.id}
                                >
                                  <Plus className="w-3.5 h-3.5" /> 新建网址
                                </button>
                                <button
                                  onClick={() => handleMagicFill(catIdx, secIdx)}
                                  className="text-xs flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-2.5 py-1.5 rounded-md transition-colors font-medium"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> AI 填充
                                </button>
                                <button
                                  onClick={() => openModal('batch_import', { sectionId: section.id })}
                                  className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors font-medium"
                                  title="批量导入"
                                >
                                  <FileText className="w-3.5 h-3.5" /> 批量导入
                                </button>
                                <div className="w-px h-4 bg-border mx-1" />
                                <button
                                  onClick={() => openModal('section', section, true)}
                                  className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary px-2 py-1.5 rounded-md transition-colors"
                                  disabled={!section.id}
                                >
                                  <Edit className="w-3.5 h-3.5" /> 编辑
                                </button>
                                <button
                                  onClick={() => handleDelete('section', section.id)}
                                  className="text-xs flex items-center gap-1 text-muted-foreground hover:text-red-500 px-2 py-1.5 rounded-md transition-colors"
                                  disabled={!section.id}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> 删除
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {section.sites.map((site, siteIdx) => (
                                <div key={site.id || siteIdx} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all group">
                                  <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center text-xs border border-border/50 shrink-0 overflow-hidden relative">
                                    {site.icon ? (
                                      <img
                                        src={site.icon}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          
                                          // 检查是否已经添加了 fallback 元素，避免重复添加
                                          if (target.parentElement?.querySelector('.fallback-icon')) {
                                            return;
                                          }

                                          const fallbackDiv = document.createElement('div');
                                          const gradient = getGradientColor(site.title || '');
                                          fallbackDiv.className = `fallback-icon flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold text-sm absolute inset-0`;
                                          fallbackDiv.innerText = (site.title || '?').trim().charAt(0).toUpperCase();
                                          target.parentElement?.appendChild(fallbackDiv);
                                        }}
                                      />
                                    ) : (
                                      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradientColor(site.title || '')} text-white font-bold text-sm`}>
                                        {(site.title || '?').trim().charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium truncate text-foreground">{site.title}</div>
                                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                                        #{site.sortOrder}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate opacity-70">{site.url}</div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openModal('site', site, true)}
                                      className="p-1.5 hover:bg-primary/10 rounded-md text-primary transition-colors"
                                      disabled={!site.id}
                                      title="编辑"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete('site', site.id)}
                                      className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-colors"
                                      disabled={!site.id}
                                      title="删除"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {section.sites.length === 0 && (
                                <div className="col-span-full text-center py-4 text-xs text-muted-foreground border border-dashed border-border/50 rounded-lg">
                                  暂无站点
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
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
                  {modalType === 'tag' && '编辑标签'}
                </>
              ) : (
                <>
                  {modalType === 'category' && '新建分类'}
                  {modalType === 'section' && '新建版块'}
                  {modalType === 'site' && '新建网址'}
                  {modalType === 'batch_import' && '批量导入网站'}
                  {modalType === 'tag' && '新建标签'}
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
              {modalType === 'category' && (
                <div>
                  <label className="block text-sm font-medium mb-1">排序权重</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={isEditMode ? modalData.sortOrder : ''}
                    placeholder="留空自动递增"
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">数字越小越靠前，留空则自动递增</p>
                </div>
              )}
              {modalType === 'section' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">排序权重</label>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={isEditMode ? modalData.sortOrder : ''}
                      placeholder="留空自动递增"
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-1">数字越小越靠前，留空则自动递增</p>
                  </div>
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
                </>
              )}
              {modalType === 'site' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
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
                      <label className="block text-sm font-medium mb-1">排序</label>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={isEditMode ? modalData.sortOrder : ''}
                        placeholder="自动"
                        className="w-full p-2 border border-border rounded-lg bg-background"
                      />
                    </div>
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
                    <div className="flex gap-2">
                      <input
                        name="icon"
                        type="text"
                        defaultValue={isEditMode ? modalData.icon : ''}
                        placeholder="输入链接或上传图片"
                        className="flex-1 p-2 border border-border rounded-lg bg-background"
                      />
                      <label className={`px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="text-sm whitespace-nowrap">上传</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleModalFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">支持远程 URL 或本地上传图片</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">角标 (Badge)</label>
                    <input
                      name="badge"
                      type="text"
                      defaultValue={isEditMode ? modalData.badge : ''}
                      placeholder="例如: Hot, New, 推荐"
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">标签 (Tags)</label>
                    <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[3rem]">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTagSelection(tag.id)}
                          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                            selectedTagIds.includes(tag.id)
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                      {tags.length === 0 && <span className="text-xs text-muted-foreground">暂无可用标签，请先在标签管理中添加</span>}
                    </div>
                  </div>
                </>
              )}
              {modalType === 'tag' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">标签名称</label>
                    <input
                      name="name"
                      required
                      defaultValue={isEditMode ? modalData.name : ''}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">颜色</label>
                    <select
                      name="color"
                      defaultValue={isEditMode ? modalData.color : 'blue'}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                    >
                      <option value="blue">蓝色</option>
                      <option value="green">绿色</option>
                      <option value="red">红色</option>
                      <option value="yellow">黄色</option>
                      <option value="purple">紫色</option>
                      <option value="pink">粉色</option>
                      <option value="indigo">靛青</option>
                      <option value="gray">灰色</option>
                    </select>
                  </div>
                </>
              )}
              {modalType === 'batch_import' && (
                <div>
                  <label className="block text-sm font-medium mb-2">批量导入数据</label>
                  <div className="bg-muted/50 p-3 rounded-lg mb-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">格式说明：每行一条记录，使用竖线 | 分隔</p>
                    <p>标题 | 链接 | 描述(选填) | 图标(选填)</p>
                    <p className="mt-2 font-medium text-foreground">示例：</p>
                    <p>Google | https://google.com | 全球最大搜索引擎</p>
                    <p>GitHub | https://github.com | 开发者平台 | https://github.com/favicon.ico</p>
                  </div>
                  <textarea
                    name="content"
                    required
                    className="w-full p-3 border border-border rounded-lg bg-background font-mono text-sm h-64"
                    placeholder="在此粘贴数据..."
                  />
                </div>
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