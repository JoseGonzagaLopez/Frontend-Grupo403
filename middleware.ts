import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminAuthToken = request.cookies.get('admin_auth_token')
  const customerAuthToken = request.cookies.get('customer_auth_token')
  const businessAuthToken = request.cookies.get('business_auth_token')

  const pathname = request.nextUrl.pathname

  const isLoginPage    = pathname === '/login'
  const isClienteLogin = pathname === '/cliente/login'
  const isClienteReg   = pathname === '/cliente/registro'

  // Rutas que requieren ser cliente
  const isClienteArea  = pathname === '/reservar' ||
                         pathname.startsWith('/reservar/') ||
                         pathname === '/mis-reservas' ||
                         pathname.startsWith('/mis-reservas/')

  // Rutas del area privada del cliente (antiguo /cliente/*)
  const isClientePrivado = pathname.startsWith('/cliente/') &&
                           !isClienteLogin && !isClienteReg

  const isNegocioArea  = pathname === '/negocio' || pathname.startsWith('/negocio/')
  const isAdminArea    = !isLoginPage && !isClienteLogin && !isClienteReg &&
                         !isClienteArea && !isClientePrivado && !isNegocioArea

  // ── Rutas de empresa ─────────────────────────────────
  if (isNegocioArea && !businessAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Rutas de cliente (reservar + mis-reservas) ───────
  if ((isClienteArea || isClientePrivado) && !customerAuthToken) {
    return NextResponse.redirect(new URL('/cliente/login', request.url))
  }

  // ── Area admin ───────────────────────────────────────
  if (isAdminArea && !adminAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Redirigir si ya esta autenticado ─────────────────
  if (isLoginPage && adminAuthToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if ((isClienteLogin || isClienteReg) && customerAuthToken) {
    return NextResponse.redirect(new URL('/reservar', request.url))
  }
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
