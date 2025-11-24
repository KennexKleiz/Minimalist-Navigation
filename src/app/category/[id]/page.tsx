'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Lock, Hash } from 'lucide-react';
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
      <header className="relative overflow-hidden py-10 sm:py-14 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-primary transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> 返回首页
                </Link>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
                {category.name}
              </h1>
              <p className="text-base text-muted-foreground">
                收录了 {category.sections.reduce((acc, sec) => acc + sec.sites.length, 0)} 个精选网站，助你高效探索
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
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`在 ${category.name} 中搜索...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-10 pr-10 rounded-full border border-border bg-card shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base placeholder:text-muted-foreground/70"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>
      </header>

      {/* Sticky Section Navigation */}
      {!searchQuery && filteredSections.length > 0 && (
        <div className="sticky top-[60px] z-40 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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

        <div className="space-y-16">
          {filteredSections.map((section) => (
            <motion.section
              id={`section-${section.id}`}
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-32"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    {section.name}
                  </h2>
                </div>
                {section.isLocked ? (
                  <span className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium border border-yellow-100">
                    <Lock className="w-3.5 h-3.5" /> 密码保护
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full font-medium">
                    {section.sites.length} 个站点
                  </span>
                )}
              </div>

              {section.isLocked ? (
                <div className="bg-gradient-to-br from-muted/50 to-background border border-border/60 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border border-border/50 flex items-center justify-center mx-auto mb-6 rotate-3">
                    <Lock className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">该板块受密码保护</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    为了保护隐私或特定内容，该板块需要输入密码才能访问。
                  </p>
                  <button
                    onClick={() => setPasswordModal({ isOpen: true, sectionId: section.id, sectionName: section.name })}
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 font-medium"
                  >
                    输入访问密码
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
