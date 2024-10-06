// src/middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

// export async function middleware(req: NextRequest) {
//     const token = await getToken({ req });
//     const { pathname } = req.nextUrl;

//     const isAuthPage = pathname === '/lander';

//     if (isAuthPage && token) {
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     if (!token && !isAuthPage) {
//         return NextResponse.redirect(new URL('/lander', req.url));
//     }

//     return NextResponse.next();
// }
export const publicRoutes = ['/api/webhooks/clerk'];

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

// export const config = {
//     matcher: ['/profile', '/archive', '/space/:path*'],
// };
