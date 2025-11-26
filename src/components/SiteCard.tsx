'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, ThumbsUp, Eye } from 'lucide-react';
import axios from 'axios';

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface SiteCardProps {
  id?: number;
  title: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  truncateDescription?: boolean;
  initialLikes?: number;
  initialViews?: number;
  badge?: string | null;
  tags?: Tag[];
  titleFontSize?: number;
  descriptionFontSize?: number;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function SiteCard({
  id,
  title,
  url,
  description,
  icon,
  truncateDescription = true,
  initialLikes = 0,
  initialViews = 0,
  badge,
  tags,
  titleFontSize,
  descriptionFontSize
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

  // 获取首字母或首个汉字
  const getFirstChar = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return '?';
    const firstChar = trimmed.charAt(0);
    // 如果是英文字母，转大写
    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase();
    }
    return firstChar;
  };

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
      className="group relative flex flex-col h-full rounded-2xl border border-border/50 bg-card p-3 sm:p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:z-50"
    >
      {/* 背景和装饰容器 - 负责裁剪 */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {/* 背景光晕 */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
        {/* 底部装饰条 */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 group-hover:w-full" />
      </div>

      {/* 角标 Badge - 左上角悬浮，更精致的样式 */}
      {badge && (
        <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 z-30">
          <span className="flex items-center justify-center px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-br-xl rounded-tl-xl shadow-lg shadow-red-500/30 animate-pulse ring-2 ring-white dark:ring-gray-900">
            {badge}
          </span>
        </div>
      )}
      
      {/* 统计信息 Stats - 右上角 */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground pointer-events-auto">
        <div className="flex items-center gap-1" title="浏览量">
          <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>{views}</span>
        </div>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition-colors hover:text-primary ${isLiked ? 'text-primary' : ''}`}
          title="推荐"
        >
          <ThumbsUp className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>
      </div>

      {/* 标签 Tags - 右侧垂直居中 */}
      {tags && tags.length > 0 && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-1 items-end z-20 pointer-events-none hidden sm:flex">
          {tags.map(tag => (
            <span key={tag.id} className={`pointer-events-auto text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm opacity-90 hover:opacity-100 transition-opacity ${colorMap[tag.color] || colorMap.blue}`}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 relative z-10 w-full text-center sm:text-left">
        {/* 左侧图标 */}
        <div className="relative h-10 w-10 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2.5 shadow-sm ring-1 ring-border/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
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
                  // 如果图片加载失败，隐藏图片并显示首字母
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  
                  // 检查是否已经添加了 fallback 元素，避免重复添加
                  if (target.parentElement?.querySelector('.fallback-icon')) {
                    return;
                  }

                  // 创建一个包含首字母的元素并插入
                  const fallbackDiv = document.createElement('div');
                  const gradient = getGradientColor(title);
                  fallbackDiv.className = `fallback-icon flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold text-2xl absolute inset-0`;
                  fallbackDiv.innerText = getFirstChar(title);
                  target.parentElement?.appendChild(fallbackDiv);
                }}
              />
            )
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradientColor(title)} text-white font-bold text-2xl`}>
              {getFirstChar(title)}
            </div>
          )}
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 min-w-0 pt-0 sm:pt-1 flex flex-col h-full w-full sm:pr-14">
          <div className="flex items-center sm:items-start justify-center sm:justify-between gap-2 mb-1">
            <h3
              className="font-bold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-1 flex-1 min-w-0 justify-center sm:justify-start"
              style={titleFontSize ? { fontSize: `${titleFontSize}px` } : undefined}
            >
              <span className="truncate">{title}</span>
            </h3>
            
            {/* 外链图标 */}
            <div className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 absolute right-2 bottom-2 z-30 hidden sm:block">
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="relative">
            <p
              className={`text-xs sm:text-sm text-muted-foreground leading-relaxed ${truncateDescription ? 'line-clamp-1 group-hover:opacity-0' : 'line-clamp-3'}`}
              style={descriptionFontSize ? { fontSize: `${descriptionFontSize}px` } : undefined}
            >
              {description || '暂无描述'}
            </p>
            {truncateDescription && description && (
              <p
                className="absolute top-0 left-0 w-full text-xs sm:text-sm text-muted-foreground leading-relaxed hidden group-hover:block z-20 bg-gray-50/95 dark:bg-gray-900/95 p-1 -m-1 rounded-md shadow-sm"
                style={descriptionFontSize ? { fontSize: `${descriptionFontSize}px` } : undefined}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.a>
  );
}