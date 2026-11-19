import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from '@/lib/firebase-auth';

export const config = {
    matcher: ['/api/admin/:path*'],
    runtime: 'nodejs',
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Login/whoami/OAuth routes establish the session itself and must stay
    // reachable without one already existing.
    if (pathname.startsWith('/api/admin/auth')) {
        return NextResponse.next();
    }

    const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const user = await verifyAdminSessionCookie(sessionCookie);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
}
