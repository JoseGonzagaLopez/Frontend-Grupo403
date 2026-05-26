import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('admin_auth_token')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Si no está autenticado y no está en la página de login, redirigir a login
  if (!authToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si está autenticado y está en la página de login, redirigir al dashboard
  if (authToken && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
