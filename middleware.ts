import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const idToken = request.cookies.get('idToken')?.value;

  const requestHeaders = new Headers(request.headers);
  if (idToken) {
    requestHeaders.set('X-ID-Token', idToken);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
