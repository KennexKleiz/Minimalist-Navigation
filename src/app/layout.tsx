import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { prisma } from "@/lib/prisma";
import { ThemeProvider } from "@/components/ThemeProvider";

export async function generateMetadata(): Promise<Metadata> {
  try {
    // 使用 raw query 获取配置，确保能获取到最新数据
    const configs: any[] = await prisma.$queryRaw`SELECT * FROM SiteConfig LIMIT 1`;
    const config = configs[0];
    
    return {
      title: config?.title || "极简智能导航",
      description: config?.subtitle || "探索数字世界的无限可能",
      icons: config?.favicon ? { icon: config.favicon } : undefined,
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "极简智能导航",
      description: "探索数字世界的无限可能",
    };
  }
}

const DEFAULT_FOOTER_HTML = '© 2024 All Rights Reserved';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let footerHtml = DEFAULT_FOOTER_HTML;
  try {
    const configs: any[] = await prisma.$queryRaw`SELECT footerHtml FROM SiteConfig LIMIT 1`;
    if (configs.length > 0 && configs[0].footerHtml) {
      footerHtml = configs[0].footerHtml;
    }
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-1">
            {children}
          </div>
          
          <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 flex items-center justify-center gap-4">
              <div
                className="[&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline"
                dangerouslySetInnerHTML={{ __html: footerHtml }}
              />
              <span>|</span>
              <a
                href="https://github.com/KennexKleiz/Minimalist-Navigation"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
                title="Minimalist Navigation"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
