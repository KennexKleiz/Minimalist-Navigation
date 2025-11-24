'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Lock, Hash, Sparkles, LayoutGrid } from 'lucide-react';
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
  password?: string | boolean;
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

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<Config>({ title: '极简智能导航', subtitle: '探索数字世界的无限可能' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; sectionId: number; sectionName: string }>({
    isOpen: false,
    sectionId: 0,
    sectionName: '',
  });
  const [activeSection, setActiveSection] = useState<number | null>(null);

  // 监听滚动以更新当前激活的板块
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id^="section-"]');
      let current: number | null = null;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = parseInt(section.getAttribute('id')?.replace('section-', '') || '0');
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredSections]);

  const scrollToSection = (sectionId: number) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const offset = 120; // 头部偏移量
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const handleUnlock = (sites: Site[], sectionId: number) => {
    if (!category) return;

    const updatedSections = category.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, sites, isLocked: false };
      }
      return sec;
    });

    setCategory({ ...category, sections: updatedSections });
    setFilteredSections(updatedSections);
  };

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      const [catsRes, configRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/config')
      ]);

      setAllCategories(catsRes.data);
      setConfig(configRes.data);

      // 找到当前分类
      const currentCategory = catsRes.data.find((cat: Category) => cat.id === parseInt(categoryId));
      if (currentCategory) {
        setCategory(currentCategory);
        setFilteredSections(currentCategory.sections);
      } else {
        // 如果分类不存在，跳转到首页
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索功能
  useEffect(() => {
    if (!category) return;

    if (!searchQuery.trim()) {
      setFilteredSections(category.sections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = category.sections.map(section => {
      const filteredSites = section.sites.filter(site =>
        site.title.toLowerCase().includes(query) ||
        site.description?.toLowerCase().includes(query) ||
        site.url.toLowerCase().includes(query)
      );
      return { ...section, sites: filteredSites };
    }).filter(section => section.sites.length > 0);

    setFilteredSections(filtered);
  }, [searchQuery, category]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar title={config.title} categories={allCategories} />

      {/* Hero Section */}
      <header className="relative overflow-hidden py-12 sm:py-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/10 via-purple-500/5 to-transparent rounded-[100%] blur-3xl opacity-60" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-sm border border-transparent hover:border-primary/20"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> 返回首页
                </Link>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                收录了 <span className="text-primary font-semibold">{category.sections.reduce((acc, sec) => acc + sec.sites.length, 0)}</span> 个精选网站
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder={`在 ${category.name} 中搜索...`}
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
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Sticky Section Navigation (Mobile) */}
      {!searchQuery && filteredSections.length > 0 && (
        <div className="lg:hidden sticky top-[60px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                      : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-20 min-h-[60vh]">
        {searchQuery && filteredSections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">未找到匹配的网站</p>
            <p className="text-muted-foreground text-sm mt-2">试试其他关键词或清空搜索</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar Navigation (Desktop) */}
          {!searchQuery && filteredSections.length > 0 && (
            <aside className="hidden lg:block w-36 sticky top-24 shrink-0">
              <div className="bg-card/30 border border-border/40 rounded-2xl p-2 backdrop-blur-sm">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">
                  板块导航
                </h3>
                <nav className="space-y-1">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-center px-2 py-2 rounded-lg text-sm font-medium transition-all block ${
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Right Content Area */}
          <div className="flex-1 w-full space-y-12">
            {filteredSections.map((section) => (
              <motion.section
                id={`section-${section.id}`}
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4 }}
                className="scroll-mt-32 bg-card/30 border border-border/40 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm"
              >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-purple-600 rounded-full shadow-sm"></div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    {section.name}
                  </h2>
                </div>
                {section.isLocked ? (
                  <span className="text-xs bg-yellow-500/10 text-yellow-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium border border-yellow-500/20">
                    <Lock className="w-3.5 h-3.5" /> 密码保护
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full font-medium border border-border/50">
                    {section.sites.length} 个站点
                  </span>
                )}
              </div>

              {section.isLocked ? (
                <div className="bg-gradient-to-br from-muted/30 to-background border border-border/50 rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-background rounded-3xl shadow-sm border border-border/50 flex items-center justify-center mx-auto mb-6 rotate-3 group">
                    <Lock className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">该板块受密码保护</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    为了保护隐私或特定内容，该板块需要输入密码才能访问。
                  </p>
                  <button
                    onClick={() => setPasswordModal({ isOpen: true, sectionId: section.id, sectionName: section.name })}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 font-medium flex items-center gap-2 mx-auto"
                  >
                    <Lock className="w-4 h-4" /> 输入访问密码
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {section.sites.map((site) => (
                    <SiteCard key={site.id} {...site} />
                  ))}
                </div>
              )}
              </motion.section>
            ))}
          </div>
        </div>

        {filteredSections.length === 0 && !searchQuery && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">该分类暂无内容</p>
            <Link
              href="/"
              className="inline-block mt-4 text-primary hover:underline"
            >
              返回首页
            </Link>
          </div>
        )}
      </main>

      <AIAssistant />

      <PasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
        onSuccess={(sites) => handleUnlock(sites, passwordModal.sectionId)}
        sectionId={passwordModal.sectionId}
        sectionName={passwordModal.sectionName}
      />
    </div>
  );
}
