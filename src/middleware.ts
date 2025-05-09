// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify, JwtPayload } from 'jsonwebtoken';

// Define the shape of our JWT payload
interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('authToken')?.value;
  const JWT_SECRET = process.env.JWT_SECRET!;

  // URLs that should be protected
  const protectedPaths = ['/profile', '/dashboard', '/attendance'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's not a protected path, proceed normally
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // If there's no token and this is a protected path, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    const decoded = verify(authToken, JWT_SECRET) as AuthTokenPayload;
    // Token is valid, proceed
    return NextResponse.next();
  } catch (error) {
    // Token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/profile/:path*', '/dashboard/:path*', '/attendance/:path*']
};