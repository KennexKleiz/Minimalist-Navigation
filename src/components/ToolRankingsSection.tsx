'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThumbsUp, Eye, Wrench } from 'lucide-react';
import Link from 'next/link';

interface Tool {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  likes: number;
  views: number;
}

interface RankingsData {
  topLiked: Tool[];
  topViewed: Tool[];
}

type RankingType = 'likes' | 'views';

export default function ToolRankingsSection() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RankingType>('likes');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await axios.get('/api/tools/rankings');
        setRankings(res.data);
      } catch (error) {
        console.error('Failed to fetch tool rankings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-16">
        <div className="h-96 bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!rankings) return null;

  const currentData = activeTab === 'likes' ? rankings.topLiked : rankings.topViewed;
  const hasData = currentData && currentData.length > 0;

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-colors"
      >
        {/* 标题和标签切换 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl">小工具排行榜</h3>
          </div>

          {/* 标签切换按钮 */}
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'likes'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>推荐榜</span>
            </button>
            <button
              onClick={() => setActiveTab('views')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'views'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>热度榜</span>
            </button>
          </div>
        </div>

        {/* 排行榜列表 */}
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {currentData.slice(0, 10).map((tool, index) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all hover:shadow-md border border-transparent hover:border-primary/20"
                >
                  {/* 排名 */}
                  <div className="relative shrink-0">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-400/30'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* 工具图标 */}
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-muted/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {tool.icon || '🔧'}
                  </div>

                  {/* 工具信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {tool.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {activeTab === 'likes' ? (
                          <>
                            <ThumbsUp className="w-3 h-3" />
                            <span className="tabular-nums">{tool.likes}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span className="tabular-nums">{tool.views}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">暂无工具数据</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
