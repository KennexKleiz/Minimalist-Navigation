'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, ThumbsUp, Eye } from 'lucide-react';
import axios from 'axios';

interface SiteCardProps {
  id?: number;
  title: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  truncateDescription?: boolean;
  initialLikes?: number;
  initialViews?: number;
}

export default function SiteCard({
  id,
  title,
  url,
  description,
  icon,
  truncateDescription = true,
  initialLikes = 0,
  initialViews = 0
}: SiteCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      const likedStatus = localStorage.getItem(`liked_${id}`);
      if (likedStatus === 'true') {
        setIsLiked(true);
      }
    }
  }, [id]);

  // 判断icon是否为SVG代码
  const isSvgCode = icon?.trim().startsWith('<svg');

  const handleView = async () => {
    if (!id) return;
    try {
      setViews(prev => prev + 1);
      await axios.post('/api/sites/interact', { id, type: 'view' });
    } catch (error) {
      console.error('Failed to record view', error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click
    e.stopPropagation();
    if (!id || isLiked) return;

    try {
      setLikes(prev => prev + 1);
      setIsLiked(true);
      if (id) {
        localStorage.setItem(`liked_${id}`, 'true');
      }
      await axios.post('/api/sites/interact', { id, type: 'like' });
    } catch (error) {
      console.error('Failed to like', error);
      setIsLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleView}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 backdrop-blur-sm"
    >
      {/* 背景光晕 */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
      
      <div className="flex items-start gap-4 relative z-10 w-full">
        {/* 左侧图标 - 始终保持白色背景以适配各种图标 */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-border/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          {icon ? (
            isSvgCode ? (
              <div
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain"
                dangerouslySetInnerHTML={{ __html: icon }}
              />
            ) : (
              <img
                src={icon}
                alt={title}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
                }}
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-xl">
              {title.charAt(0)}
            </div>
          )}
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 min-w-0 pt-1 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors flex-1">
              {title}
            </h3>
            
            {/* 数据统计与外链图标 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1" title="浏览量">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{views}</span>
                </div>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors hover:text-primary ${isLiked ? 'text-primary' : ''}`}
                  title="推荐"
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes}</span>
                </button>
              </div>
              <div className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          <p className={`text-sm text-muted-foreground leading-relaxed ${truncateDescription ? 'line-clamp-1' : 'line-clamp-3'}`}>
            {description || '暂无描述'}
          </p>
        </div>
      </div>

      {/* 底部装饰条 */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 group-hover:w-full" />
    </motion.a>
  );
}