'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 此页面已废弃
 *
 * 为了安全考虑，AI 配置功能已统一到管理后台
 * 避免多入口导致的安全隐患
 *
 * 请通过以下方式访问：
 * 1. 访问 /admin/dashboard
 * 2. 点击右侧菜单的 "AI配置"
 */
export default function AIConfigPage() {
  const router = useRouter();

  useEffect(() => {
    // 立即重定向到管理后台
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            页面已废弃
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            为了安全考虑，AI 配置功能已统一到管理后台
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            正在自动跳转到管理后台...
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>提示：</strong>请通过管理后台右侧菜单的 "AI配置" 访问此功能
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即前往管理后台
          </button>
        </div>
      </div>
    </div>
  );
}
