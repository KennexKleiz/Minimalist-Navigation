'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThumbsUp, Eye, Clock, Shuffle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Site {
  id: number;
  title: string;
  url: string;
  icon: string;
  likes: number;
  views: number;
}

interface RankingsData {
  recommended: Site[];
  popular: Site[];
  newest: Site[];
  random: Site[];
}

export default function RankingsSection() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await axios.get('/api/sites/rankings');
        setRankings(res.data);
      } catch (error) {
        console.error('Failed to fetch rankings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-muted/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rankings) return null;

  const lists = [
    { title: '推荐站点', icon: ThumbsUp, data: rankings.recommended, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: '热门浏览', icon: Eye, data: rankings.popular, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: '最新收录', icon: Clock, data: rankings.newest, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: '随机探索', icon: Shuffle, data: rankings.random, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {lists.map((list, listIndex) => (
        <motion.div
          key={list.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: listIndex * 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-colors"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <div className={`p-2 rounded-lg ${list.bg} ${list.color}`}>
              <list.icon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">{list.title}</h3>
          </div>

          <div className="space-y-3">
            {list.data.slice(0, 10).map((site, index) => (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className={`text-sm font-bold w-5 text-center ${
                  index < 3 ? list.color : 'text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                
                <div className="relative w-6 h-6 shrink-0 rounded overflow-hidden bg-background">
                  {site.icon ? (
                    site.icon.startsWith('<svg') ? (
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: site.icon }}
                      />
                    ) : (
                      <img
                        src={site.icon}
                        alt={site.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${site.url}&sz=64`;
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                      {site.title.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {site.title}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground tabular-nums opacity-60 group-hover:opacity-100">
                  {list.title === '推荐站点' && site.likes}
                  {list.title === '热门浏览' && site.views}
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}