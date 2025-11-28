'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThumbsUp, Eye } from 'lucide-react';
import axios from 'axios';

interface ToolCardProps {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  initialLikes: number;
  initialViews: number;
}

export default function ToolCard({
  id,
  name,
  description,
  icon,
  initialLikes,
  initialViews
}: ToolCardProps) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [views, setViews] = useState(initialViews || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const likedStatus = localStorage.getItem(`tool_liked_${id}`);
    if (likedStatus === 'true') {
      setIsLiked(true);
    }
  }, [id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) return;

    try {
      setLikes(prev => prev + 1);
      setIsLiked(true);
      localStorage.setItem(`tool_liked_${id}`, 'true');
      await axios.post('/api/tools/interact', { id, type: 'like' });
    } catch (error) {
      console.error('Failed to like', error);
      setIsLiked(false);
      setLikes(prev => prev - 1);
      localStorage.removeItem(`tool_liked_${id}`);
    }
  };

  return (
    <Link
      href={`/tools/${id}`}
      className="block"
    >
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative flex flex-col h-full rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
          <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 group-hover:w-full" />
        </div>

        {/* 统计信息 - 右上角 */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" title="浏览量">
            <Eye className="h-3 w-3" />
            <span>{views}</span>
          </div>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors hover:text-primary ${isLiked ? 'text-primary' : ''}`}
            title="推荐"
          >
            <ThumbsUp className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
        </div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-2 shadow-sm ring-1 ring-border/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center text-2xl">
            {icon || '🔧'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1 truncate">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description || '暂无描述'}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
