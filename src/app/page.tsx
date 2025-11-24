'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Lock } from 'lucide-react';
import SiteCard from '@/components/SiteCard';
import AIAssistant from '@/components/AIAssistant';
import Navbar from '@/components/Navbar';
import PasswordModal from '@/components/PasswordModal';
import { PageSkeleton } from '@/components/SkeletonLoader';

interface Site {
  id: number;
  title: string;
  url: string;
  description: string;
  icon: string;
}

interface Section {
  id: number;
  name: string;
  icon: string;
  sites: Site[];
  password?: boolean;
  isLocked?: boolean;
}

interface Category {
  id: number;
  name: string;
  sections: Section[];
}

interface Config {
  title: string;
  subtitle: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<Config>({ title: '极简智能导航', subtitle: '探索数字世界的无限可能' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; sectionId: number; sectionName: string }>({
    isOpen: false,
    sectionId: 0,
    sectionName: '',
  });

  const handleUnlock = (sites: Site[], categoryId: number, sectionId: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          sections: cat.sections.map(sec => {
            if (sec.id === sectionId) {
              return { ...sec, sites, isLocked: false };
            }
            return sec;
          })
        };
      }
      return cat;
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, configRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/config')
        ]);
        setCategories(catsRes.data);
        setFilteredCategories(catsRes.data);
        setConfig(configRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search functionality - 搜索分类、板块和网站
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = categories.filter(category => {
      // 搜索分类名称
      if (category.name.toLowerCase().includes(query)) {
        return true;
      }

      // 搜索板块名称
      const hasMatchingSection = category.sections.some(section =>
        section.name.toLowerCase().includes(query)
      );
      if (hasMatchingSection) {
        return true;
      }

      // 搜索网站标题、描述或URL
      const hasMatchingSite = category.sections.some(section =>
        section.sites.some(site =>
          site.title.toLowerCase().includes(query) ||
          site.description?.toLowerCase().includes(query) ||
          site.url.toLowerCase().includes(query)
        )
      );

      return hasMatchingSite;
    });

    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar title={config.title} categories={categories} />

      {/* Hero Section */}
      <header className="relative overflow-hidden py-12 sm:py-16 border-b border-border/50">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {config.title}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {config.subtitle}
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索分类、板块或网站..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 rounded-full border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">未找到匹配的分类</p>
            <p className="text-muted-foreground text-sm mt-2">试试其他关键词或清空搜索</p>
          </div>
        )}

        {/* 分类卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => {
            const totalSites = category.sections.reduce((sum, section) => sum + section.sites.length, 0);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/category/${category.id}`}
                  className="block group"
                >
                  <div className="relative h-48 bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    {/* 背景装饰 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* 内容 */}
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.sections.length} 个板块 · {totalSites} 个网站
                        </p>
                      </div>

                      {/* 板块预览 */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {category.sections.slice(0, 3).map((section) => (
                          <span
                            key={section.id}
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              section.isLocked
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {section.isLocked && <Lock className="w-3 h-3" />}
                            {section.name}
                          </span>
                        ))}
                        {category.sections.length > 3 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                            +{category.sections.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 箭头图标 */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && !searchQuery && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">暂无分类</p>
            <p className="text-muted-foreground text-sm mt-2">请联系管理员添加分类</p>
          </div>
        )}
      </main>

      <AIAssistant />

      <PasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
        onSuccess={(sites) => {
          // 这里我们无法直接更新首页的分类数据，因为首页只展示概览
          // 但我们可以选择跳转到分类页，或者简单地提示解锁成功
          // 实际上，首页点击分类卡片是跳转到分类页，所以这里不需要处理解锁逻辑
          // 首页只需要展示锁图标即可
        }}
        sectionId={passwordModal.sectionId}
        sectionName={passwordModal.sectionName}
      />
    </div>
  );
}
