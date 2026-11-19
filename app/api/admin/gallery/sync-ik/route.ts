import { NextResponse } from 'next/server';
import { syncImageKitWithFirestore } from '@/lib/gallery-cloud';
import { getAuthenticatedUser } from '@/lib/firebase-auth';
import { recordAuditTrail } from '@/lib/audit';

export async function POST() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await syncImageKitWithFirestore();
        if (result.success) {
            await recordAuditTrail('UPDATE', 'GALLERY', 'all', {
                added: result.added,
                total: result.total,
            });
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('ImageKit Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
