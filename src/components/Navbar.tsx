'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Menu, X, Compass } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
}

interface NavbarProps {
  title: string;
  categories: Category[];
}

export default function Navbar({ title, categories }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              {title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === '/' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              首页
            </Link>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === `/category/${cat.id}` ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {cat.name}
              </Link>
            ))}
            {categories.length > 6 && (
              <span className="text-gray-400 text-sm">...</span>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">管理后台</span>
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
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
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
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