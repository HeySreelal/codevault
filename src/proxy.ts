// src/proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;

  // If user is authenticated and trying to access login, redirect to home
  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!authToken && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
