'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params.id as string;

  const [tool, setTool] = useState<Tool | null>(null);
  const [navCategories, setNavCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTool();
    fetchNavCategories();
    fetchConfig();
  }, [toolId]);

  const fetchTool = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`/api/tools/${toolId}`);
      setTool(res.data);
    } catch (error: any) {
      console.error('Failed to fetch tool', error);
      setError(error.response?.status === 404 ? '工具不存在' : '加载失败');
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
      <header className="relative py-12 sm:py-16">
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
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => router.push('/tools')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-sm border border-transparent hover:border-primary/20"
                >
                  ← 返回工具列表
                </button>
                <a
                  href="/"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-sm border border-transparent hover:border-primary/20"
                >
                  返回首页
                </a>
              </div>
              {tool && (
                <>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {tool.icon && (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl shrink-0 shadow-lg">
                        {tool.icon}
                      </div>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                    {tool.name}
                  </h1>
                  {tool.description && (
                    <p className="text-lg text-muted-foreground">
                      {tool.description}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20" style={{ maxWidth: config?.containerMaxWidth || '1440px' }}>
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-muted/20 rounded-2xl border border-border/40">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">加载工具中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-muted/20 rounded-2xl border border-border/40">
              <div className="text-5xl">😕</div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">{error}</p>
                <button
                  onClick={() => router.push('/tools')}
                  className="text-sm text-primary hover:underline"
                >
                  返回工具列表
                </button>
              </div>
            </div>
          </div>
        ) : tool ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <iframe
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                className="w-full h-[800px] border-0 rounded-xl bg-white dark:bg-[#18181b]"
                srcDoc={tool.code}
                title={tool.name}
              />
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
