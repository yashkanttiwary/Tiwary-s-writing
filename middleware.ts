import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  
  // Protect admin and private API routes
  if (url.startsWith('/admin') || url.startsWith('/api/private')) {
    const basicAuth = req.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      
      const expectedPassword = process.env.ADMIN_SECRET || 'admin123';
      if (pwd === expectedPassword) {
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'private, no-store');
        
        // Add security headers for admin
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");
        return response;
      }
    }
    
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
        'Cache-Control': 'private, no-store',
      },
    });
  }

  // General Security Headers for all public responses
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export const config = {
  matcher: ['/(.*)'],
};
