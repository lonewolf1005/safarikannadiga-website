import { NextResponse } from 'next/server';
import { syncGoogleReviews, syncFacebookReviews } from '@/lib/review-sync';

// Set a long timeout for sync operations if hosted on Vercel Pro, but standard is 10s on hobby.
// We'll keep logic fast.

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const cronSecret = process.env.CRON_SECRET;

    // Security check: in production, require configured CRON_SECRET and matching key/header
    const isAuthorized = cronSecret && (
        key === cronSecret || req.headers.get('Authorization') === `Bearer ${cronSecret}`
    );

    if (process.env.NODE_ENV === 'production' && !isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run syncs in parallel
    const [googleResult, fbResult] = await Promise.all([
        syncGoogleReviews(),
        syncFacebookReviews()
    ]);

    return NextResponse.json({
        success: true,
        results: {
            google: googleResult,
            facebook: fbResult
        },
        timestamp: new Date().toISOString()
    });
}
