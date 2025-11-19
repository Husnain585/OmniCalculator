import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const idToken = request.cookies.get('idToken')?.value;

  const requestHeaders = new Headers(request.headers);
  if (idToken) {
    requestHeaders.set('X-ID-Token', idToken);
  }

  // Clone the request headers and set a new header `x-hello-from-middleware1`
  // const requestHeaders = new Headers(request.headers)
  // requestHeaders.set('x-hello-from-middleware1', 'hello')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
