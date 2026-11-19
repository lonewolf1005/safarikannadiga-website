import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clearCache } from '@/lib/gallery-cloud';
import { getAuthenticatedUser } from '@/lib/firebase-auth';

/**
 * Cache Revalidation API
 * Clears the server-side memory cache and triggers Next.js revalidation.
 */
export async function POST() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        clearCache();
        revalidatePath('/', 'layout');
        revalidatePath('/gallery', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Revalidation Error:', error);
        return NextResponse.json({ error: 'Revalidation Failed' }, { status: 500 });
    }
}
