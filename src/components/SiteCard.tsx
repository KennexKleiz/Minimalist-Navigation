'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface SiteCardProps {
  title: string;
  url: string;
  description?: string | null;
  icon?: string | null;
}

export default function SiteCard({ title, url, description, icon }: SiteCardProps) {
  // 判断icon是否为SVG代码
  const isSvgCode = icon?.trim().startsWith('<svg');

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      whileHover={{ y: -4 }}
    >
      {/* 流光扫射效果 */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-scan bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />

      {/* 底部充能条 */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />

      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted p-2 transition-transform duration-500 group-hover:rotate-12">
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
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description || '暂无描述'}
          </p>
        </div>
      </div>
    </motion.a>
  );
}