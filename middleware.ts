import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminAuthToken = request.cookies.get('admin_auth_token')
  const customerAuthToken = request.cookies.get('customer_auth_token')
  const businessAuthToken = request.cookies.get('business_auth_token')

  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isReservarPage = pathname === '/reservar' || pathname.startsWith('/reservar/')

  // Áreas protegidas
  const isCustomerArea = pathname === '/cliente' || pathname.startsWith('/cliente/') || isReservarPage
  const isNegocioArea = pathname === '/negocio' || pathname.startsWith('/negocio/')
  const isAdminArea = (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/negocios' ||
    pathname.startsWith('/negocios/') ||
    pathname === '/customers' ||
    pathname.startsWith('/customers/') ||
    pathname === '/solicitudes' ||
    pathname.startsWith('/solicitudes/') ||
    pathname === '/bookings' ||
    pathname.startsWith('/bookings/') ||
    pathname === '/payments' ||
    pathname.startsWith('/payments/')
  )

  // ── Área cliente: requiere customer token ──────────────────────────
  if (isCustomerArea && !customerAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Área negocio: requiere business token ──────────────────────────
  if (isNegocioArea && !businessAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Área admin: requiere admin token ───────────────────────────────
  if (isAdminArea && !adminAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Página de login: redirigir si ya está autenticado ─────────────
  if (isLoginPage && adminAuthToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (isLoginPage && customerAuthToken) {
    return NextResponse.redirect(new URL('/cliente', request.url))
  }
  if (isLoginPage && businessAuthToken) {
    return NextResponse.redirect(new URL('/negocio/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
