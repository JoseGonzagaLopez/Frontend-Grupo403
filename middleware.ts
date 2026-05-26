import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminAuthToken = request.cookies.get('admin_auth_token')
  const customerAuthToken = request.cookies.get('customer_auth_token')
  
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isPublicBooking = pathname === '/reservar'
  const isCustomerAuthPage = pathname.startsWith('/cliente/')

  // Redirigir a login de cliente si intenta reservar sin estar autenticado
  if (isPublicBooking && !customerAuthToken) {
    return NextResponse.redirect(new URL('/cliente/login', request.url))
  }

  // Redirigir a reservar si ya está logueado como cliente e intenta ir a login de cliente
  if (isCustomerAuthPage && customerAuthToken) {
    return NextResponse.redirect(new URL('/reservar', request.url))
  }

  // Rutas de administrador (todo excepto login de admin, reservar y páginas de cliente)
  if (!isLoginPage && !isPublicBooking && !isCustomerAuthPage) {
    if (!adminAuthToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Si está autenticado como admin y está en la página de login de admin, redirigir al dashboard
  if (adminAuthToken && isLoginPage) {
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
