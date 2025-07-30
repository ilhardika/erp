import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Redirect to dashboard if accessing root while authenticated
    if (req.nextUrl.pathname === '/' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users on root to login
    if (req.nextUrl.pathname === '/' && !req.nextauth.token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow login and register pages without authentication
        if (req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/register')) {
          return true
        }
        // Require authentication for dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        // Allow root path (will be handled in middleware function)
        if (req.nextUrl.pathname === '/') {
          return true
        }
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/register'
  ]
}
