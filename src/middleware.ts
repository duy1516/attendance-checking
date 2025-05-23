import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the shape of our JWT payload
interface AuthTokenPayload {
  id: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname); // Debug log

  const authToken = request.cookies.get('authToken')?.value;
  console.log('Auth token exists:', !!authToken); // Don't log the actual token

  const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret_key';
  const secret = new TextEncoder().encode(JWT_SECRET);

  const protectedPaths = ['/profile, /class'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  console.log('Is protected path:', isProtectedPath); // Debug log

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  if (!authToken) {
    console.log('No auth token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(authToken, secret);
    const decoded = payload as unknown as AuthTokenPayload;

    console.log('Token verified for user ID:', decoded.id);
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/profile/:path*, /class/:path*']
};
