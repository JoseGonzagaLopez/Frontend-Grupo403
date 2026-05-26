import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminAuthToken = request.cookies.get('admin_auth_token')
  const customerAuthToken = request.cookies.get('customer_auth_token')
  const businessAuthToken = request.cookies.get('business_auth_token')

  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isPublicBooking = pathname === '/reservar'
  const isCustomerArea = pathname.startsWith('/cliente/')
  const isNegocioArea = pathname === '/negocio' || pathname.startsWith('/negocio/')
  const isAdminArea = !isLoginPage && !isPublicBooking && !isCustomerArea && !isNegocioArea

  // ── Rutas de empresa ──────────────────────────────────
  if (isNegocioArea && !businessAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Reservar: requiere ser cliente ────────────────────
  if (isPublicBooking && !customerAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Área cliente ──────────────────────────────────────
  if (isCustomerArea && customerAuthToken) {
    return NextResponse.redirect(new URL('/reservar', request.url))
  }

  // ── Área admin ────────────────────────────────────────
  if (isAdminArea && !adminAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está autenticado como admin y va al login, lo mandamos al dashboard
  if (isLoginPage && adminAuthToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si ya está autenticado como cliente y va al login, lo mandamos a reservar
  if (isLoginPage && customerAuthToken) {
    return NextResponse.redirect(new URL('/reservar', request.url))
  }

  // Si ya está autenticado como empresa y va al login, lo mandamos al negocio
  if (isLoginPage && businessAuthToken) {
    return NextResponse.redirect(new URL('/negocio', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
