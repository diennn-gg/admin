import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/dashboard']

export async function middleware(request) {
  const path = request.nextUrl.pathname
  
  // Kiểm tra nếu đường dẫn nằm trong danh sách cần bảo vệ (Dashboard và các trang con)
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = path === '/login'

  // Use request.cookies instead of next/headers in middleware
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)
  const isAuth = !!session?.userId

  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicRoute && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
