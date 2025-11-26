'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Lock, ArrowRight, Sparkles, Globe, Zap } from 'lucide-react';
import SiteCard from '@/components/SiteCard';
import AIAssistant from '@/components/AIAssistant';
import Navbar from '@/components/Navbar';
import PasswordModal from '@/components/PasswordModal';
import RankingsSection from '@/components/RankingsSection';
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
  logo?: string;
  backgroundImage?: string;
  backgroundImages?: string;
  backgroundMode?: string;
}

// 强制动态渲染，确保页面内容始终是最新的
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<Config>({ title: '极简智能导航', subtitle: '探索数字世界的无限可能' });
  const [currentBg, setCurrentBg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
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

        // Handle background logic
        const cfg = configRes.data;
        if (cfg.backgroundMode === 'random' && cfg.backgroundImages) {
          try {
            const images = JSON.parse(cfg.backgroundImages);
            if (images.length > 0) {
              const randomImage = images[Math.floor(Math.random() * images.length)];
              setCurrentBg(randomImage);
            }
          } catch (e) {
            console.error('Failed to parse background images', e);
          }
        } else {
          setCurrentBg(cfg.backgroundImage || null);
        }
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
      setFilteredSites([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // 1. 过滤分类（用于保留原有逻辑，虽然可能不再直接渲染）
    const filteredCats = categories.filter(category => {
      if (category.name.toLowerCase().includes(query)) return true;
      const hasMatchingSection = category.sections.some(section =>
        section.name.toLowerCase().includes(query)
      );
      if (hasMatchingSection) return true;
      return category.sections.some(section =>
        section.sites.some(site =>
          site.title.toLowerCase().includes(query) ||
          site.description?.toLowerCase().includes(query) ||
          site.url.toLowerCase().includes(query)
        )
      );
    });
    setFilteredCategories(filteredCats);

    // 2. 收集所有匹配的站点（用于直接展示）
    const sites: Site[] = [];
    categories.forEach(category => {
      category.sections.forEach(section => {
        // 跳过密码保护的板块，保护隐私
        if (section.isLocked) return;

        section.sites.forEach(site => {
          if (
            site.title.toLowerCase().includes(query) ||
            (site.description && site.description.toLowerCase().includes(query)) ||
            site.url.toLowerCase().includes(query)
          ) {
            sites.push(site);
          }
        });
      });
    });
    setFilteredSites(sites);
  }, [searchQuery, categories]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
      <Navbar title={config.title} categories={categories} logo={config.logo} />

      {/* Hero Section */}
      <header className="relative pt-20 pb-24 sm:pt-32 sm:pb-36">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {currentBg ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-20 transition-opacity duration-500"
                style={{ backgroundImage: `url('${currentBg}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/10 via-purple-500/5 to-transparent rounded-[100%] blur-3xl opacity-60" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </>
          )}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4" />
                <span>探索数字世界的无限可能</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50">
                {config.title || '极简智能导航'}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {config.subtitle || '探索数字世界的无限可能'}
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="搜索分类、板块或网站..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-14 pr-14 rounded-full border border-border/50 bg-background/80 backdrop-blur-xl shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* Quick Tags */}
            {!searchQuery && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center gap-2"
              >
                <span className="text-sm text-muted-foreground mr-2">热门分类:</span>
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className="text-sm px-3 py-1 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                  >
                    {cat.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-24">
        {/* 排行榜区域 - 仅在未搜索时显示 */}
        {!searchQuery && <RankingsSection />}


        {/* 搜索结果展示 */}
        {searchQuery ? (
          <>
            {filteredSites.length > 0 ? (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
              >
                {filteredSites.map((site) => (
                  <motion.div
                    key={site.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <SiteCard
                      {...site}
                      truncateDescription={true} // 搜索结果默认截断
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">未找到匹配的网站</p>
                <p className="text-muted-foreground text-sm mt-2">试试其他关键词</p>
              </div>
            )}
          </>
        ) : (
          /* 默认分类展示 */
          <>
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {categories.map((category) => {
                const totalSites = category.sections.reduce((sum, section) => sum + section.sites.length, 0);

                return (
                  <motion.div
                    key={category.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <Link
                      href={`/category/${category.id}`}
                      className="block group h-full"
                    >
                      <div className="relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                        {/* 背景装饰 */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />

                        {/* 内容 */}
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                              <Zap className="w-3 h-3" />
                              {totalSites}
                            </div>
                          </div>

                          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mt-3">
                              {category.sections.slice(0, 3).map((section) => (
                                <span
                                  key={section.id}
                                  className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                                    section.isLocked
                                      ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                                      : 'bg-muted/50 text-muted-foreground border border-border/50 group-hover:border-primary/20'
                                  }`}
                                >
                                  {section.isLocked && <Lock className="w-3 h-3" />}
                                  {section.name}
                                </span>
                              ))}
                              {category.sections.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded-md bg-muted/30 text-muted-foreground">
                                  +{category.sections.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            进入分类 <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {categories.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">暂无分类</p>
                <p className="text-muted-foreground text-sm mt-2">请联系管理员添加分类</p>
              </div>
            )}
          </>
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
