'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Menu, X, Compass, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface Category {
  id: number;
  name: string;
}

interface NavbarProps {
  title: string;
  categories: Category[];
  logo?: string;
  showTools?: boolean;
}

export default function Navbar({ title, categories, logo, showTools = false }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-2xl border-b border-border/30 shadow-2xl">
        {/* 动态渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 opacity-50" />

        {/* 顶部多彩渐变线 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 opacity-80" />

        {/* 底部光晕效果 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
          {/* Logo Area - 增强版 */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Link href="/" className="flex items-center gap-3 group relative">
              <div className="relative">
                {logo ? (
                  <motion.img
                    src={logo}
                    alt={title}
                    className="w-10 h-10 object-contain relative z-10"
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  />
                ) : (
                  <motion.div
                    className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 p-2 rounded-xl text-white shadow-2xl"
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Compass className="w-6 h-6 relative z-10" />
                    {/* 发光效果 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-foreground tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  {title}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wider">NAVIGATION</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation - 胶囊式设计 */}
          <div className="hidden lg:flex items-center gap-2 bg-muted/50 backdrop-blur-sm rounded-full px-2 py-1.5 border border-border/50 shadow-inner">
            <Link href="/" className="relative px-4 py-2 text-sm font-semibold transition-all group rounded-full whitespace-nowrap">
              <span className={pathname === '/' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>
                首页
              </span>
              {pathname === '/' && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full border border-primary/30" />
              )}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="relative px-4 py-2 text-sm font-semibold transition-all group rounded-full whitespace-nowrap"
              >
                <span className={pathname === `/category/${cat.id}` ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>
                  {cat.name}
                </span>
                {pathname === `/category/${cat.id}` && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full border border-primary/30" />
                )}
              </Link>
            ))}
            {showTools && (
              <Link href="/tools" className="relative px-4 py-2 text-sm font-semibold transition-all group rounded-full whitespace-nowrap">
                <span className={pathname === '/tools' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>
                  在线工具
                </span>
                {pathname === '/tools' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full border border-primary/30" />
                )}
              </Link>
            )}
          </div>

          {/* Right Actions - 增强版 */}
          <div className="flex items-center gap-3">
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                className="relative p-2.5 text-muted-foreground hover:text-primary rounded-xl transition-all overflow-hidden group"
                aria-label="Toggle theme"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: 360 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 relative z-10" />
                ) : (
                  <Sun className="w-5 h-5 relative z-10" />
                )}
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
              whileTap={{ scale: 0.85, rotate: 90 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                首页
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === `/category/${cat.id}`
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              {showTools && (
                <Link
                  href="/tools"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/tools'
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  在线工具
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
