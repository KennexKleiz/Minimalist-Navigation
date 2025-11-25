import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes (except login page)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('auth_token');

    if (!authToken || authToken.value !== 'admin_logged_in') {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check if the request is for admin API routes
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/login')) {
    // List of public API routes that don't require authentication
    const publicRoutes = [
      '/api/categories',
      '/api/config',
      '/api/ai/recommend',
      '/api/sections/verify',
      '/api/sites/interact',
      '/api/sites/rankings'
    ];
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route);

    // Only check authentication for non-public routes
    if (!isPublicRoute) {
      const authToken = request.cookies.get('auth_token');

      if (!authToken || authToken.value !== 'admin_logged_in') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
