import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')

    const isAppPage = request.nextUrl.pathname.startsWith('/app')
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

    // Redirect to login if not authenticated
    if (!token && (isAppPage || isAdminPage)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect to app if authenticated and trying to access auth pages
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/app', request.url))
    }

    // Check admin role for admin pages
    if (isAdminPage && token) {
        if (token.role !== 'ADMIN' && token.role !== 'OPERATOR') {
            return NextResponse.redirect(new URL('/app', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/app/:path*', '/admin/:path*', '/login', '/register'],
}
