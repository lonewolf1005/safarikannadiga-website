import { NextResponse } from 'next/server';
import { syncGoogleReviews, syncFacebookReviews } from '@/lib/review-sync';
import { revalidateTag } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/firebase-auth';

export async function POST() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [googleResult, fbResult] = await Promise.all([
            syncGoogleReviews(),
            syncFacebookReviews()
        ]);

        // Invalidate testimonials cache so user sees new reviews instantly on frontend
        revalidateTag('testimonials', 'max');

        return NextResponse.json({
            success: true,
            results: {
                google: googleResult,
                facebook: fbResult
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
