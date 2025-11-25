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
    const config: any = await prisma.siteConfig.findFirst();
    return {
      title: config?.title || "极简智能导航",
      description: config?.subtitle || "探索数字世界的无限可能",
      icons: config?.favicon ? { icon: config.favicon } : undefined,
    };
  } catch (error) {
    return {
      title: "极简智能导航",
      description: "探索数字世界的无限可能",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
