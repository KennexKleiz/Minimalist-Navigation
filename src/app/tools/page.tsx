'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import axios from 'axios';

interface Tool {
  id: number;
  name: string;
  description: string | null;
  code: string;
  icon: string | null;
  categoryId: number;
}

interface ToolCategory {
  id: number;
  name: string;
  tools: Tool[];
}

export default function ToolsPage() {
  const [toolCategories, setToolCategories] = useState<ToolCategory[]>([]);
  const [navCategories, setNavCategories] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchToolCategories();
    fetchNavCategories();
    fetchConfig();
  }, []);

  const fetchToolCategories = async () => {
    try {
      const res = await axios.get('/api/tools/categories');
      setToolCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch tool categories', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNavCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setNavCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch nav categories', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/config');
      setConfig(res.data);
    } catch (error) {
      console.error('Failed to fetch config', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title={config?.title || '极简智能导航'}
        categories={navCategories}
        logo={config?.logo}
        showTools={config?.showTools}
      />

      {/* Hero Section */}
      <header className="relative py-12 sm:py-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {config?.backgroundImage ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-20 transition-opacity duration-500"
                style={{ backgroundImage: `url('${config.backgroundImage}')` }}
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
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-sm border border-transparent hover:border-primary/20"
                >
                  ← 返回首页
                </a>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                在线工具
              </h1>
              <p className="text-lg text-muted-foreground">
                实用的在线小工具集合，提升您的工作效率
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20" style={{ maxWidth: config?.containerMaxWidth || '1440px' }}>
        {selectedTool ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setSelectedTool(null)}
              className="mb-6 px-4 py-2 bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all flex items-center gap-2"
            >
              ← 返回工具列表
            </button>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6 border-b border-border/50 pb-6">
                {selectedTool.icon && (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                    {selectedTool.icon}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedTool.name}</h2>
                  {selectedTool.description && (
                    <p className="text-muted-foreground mt-1">{selectedTool.description}</p>
                  )}
                </div>
              </div>

              <iframe
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                className="w-full h-[800px] border-0 rounded-xl bg-white dark:bg-[#18181b]"
                srcDoc={selectedTool.code}
                title={selectedTool.name}
              />
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar Navigation (Desktop) */}
            {toolCategories.length > 0 && (
              <aside className="hidden lg:block w-36 sticky top-24 shrink-0">
                <div className="bg-card/30 border border-border/40 rounded-2xl p-2 backdrop-blur-sm">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">
                    工具分类
                  </h3>
                  <nav className="space-y-1">
                    {toolCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          const element = document.getElementById(`category-${category.id}`);
                          if (element) {
                            const offset = 100;
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = element.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;
                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className="w-full text-center px-2 py-2 rounded-lg text-sm font-medium transition-all block text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {category.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            <div className="flex-1 w-full space-y-12">
              {toolCategories.map((category) => (
                <motion.section
                  id={`category-${category.id}`}
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6 pl-2">
                    <div className="w-1.5 h-7 bg-gradient-to-b from-primary to-purple-600 rounded-full shadow-sm"></div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      {category.name}
                    </h2>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full font-medium border border-border/50">
                      {category.tools.length} 个工具
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.tools.map((tool) => (
                      <motion.div
                        key={tool.id}
                        whileHover={{ y: -5 }}
                        className="group relative flex flex-col h-full rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
                        onClick={() => setSelectedTool(tool)}
                      >
                        {/* 背景装饰 */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
                          <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 group-hover:w-full" />
                        </div>

                        <div className="flex items-start gap-4 relative z-10">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-2 shadow-sm ring-1 ring-border/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center text-2xl">
                            {tool.icon || '🔧'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                              {tool.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {tool.description || '暂无描述'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}

              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-muted/20 rounded-2xl border border-border/40">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">加载工具中...</p>
                  </div>
                </div>
              ) : toolCategories.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                  <p className="text-muted-foreground text-lg">暂无工具</p>
                  <p className="text-muted-foreground text-sm mt-2">请在后台添加工具</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
