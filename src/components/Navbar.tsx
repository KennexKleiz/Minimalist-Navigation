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
}

export default function Navbar({ title, categories, logo }: NavbarProps) {
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
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 group">
            {logo ? (
              <img
                src={logo}
                alt={title}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                <Compass className="w-5 h-5" />
              </div>
            )}
            <span className="text-lg font-bold text-foreground tracking-tight">
              {title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              首页
            </Link>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === `/category/${cat.id}` ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {cat.name}
              </Link>
            ))}
            {categories.length > 6 && (
              <span className="text-muted-foreground text-sm">...</span>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
            )}

            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">管理后台</span>
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
            className="md:hidden bg-background border-b border-border overflow-hidden"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}