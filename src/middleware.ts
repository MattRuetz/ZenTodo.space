// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname === '/lander';

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/lander', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile', '/archive', '/space/:path*'],
};
