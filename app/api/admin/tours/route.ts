import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
    getTours,
    createTour,
    updateTour,
    deleteTour,
    markTourCompleted,
    markTourSoldOut,
    TourInput
} from '@/lib/tours';
import { recordAuditTrail } from '@/lib/audit';
import { getAuthenticatedUser } from '@/lib/firebase-auth';

function isValidDateRange(start: string, end: string): boolean {
    return new Date(end).getTime() >= new Date(start).getTime();
}

// GET: List all tours
export async function GET(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') as 'upcoming' | 'sold-out' | 'completed' | 'draft' | 'all' | null;
        const featured = searchParams.get('featured');

        const tours = await getTours({
            status: status || 'all',
            featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
            includeDrafts: true,
        });

        return NextResponse.json(tours);
    } catch (error) {
        console.error('Tours Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
    }
}

// POST: Create a new tour
export async function POST(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Extract tour data
        const tourData: TourInput = {
            title: body.title,
            destination: body.destination,
            start_date: body.start_date,
            end_date: body.end_date,
            spots_total: parseInt(body.spots_total) || 12,
            spots_left: parseInt(body.spots_left) || 12,
            highlights: Array.isArray(body.highlights) ? body.highlights : [],
            description: body.description || null,
            status: body.status || 'upcoming',
            featured: !!body.featured,
            brochure_url: body.brochure_url || null,
            image_url: body.image_url || null,
        };

        // Validate required fields
        if (!tourData.title || !tourData.destination || !tourData.start_date || !tourData.end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!isValidDateRange(tourData.start_date, tourData.end_date)) {
            return NextResponse.json({ error: 'End date cannot be before the start date' }, { status: 400 });
        }

        if (tourData.spots_left > tourData.spots_total) {
            return NextResponse.json({ error: 'Spots left cannot exceed total spots' }, { status: 400 });
        }

        const result = await createTour(tourData);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            revalidatePath('/upcoming-tours', 'layout');
            await recordAuditTrail('CREATE', 'TOUR', result.tour?.id || tourData.title, {
                title: tourData.title,
                destination: tourData.destination,
            });
            return NextResponse.json({ success: true, tour: result.tour });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Create Error:', error);
        return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 });
    }
}

// PUT: Update a tour
export async function PUT(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const id = body.id as string;

        if (!id) {
            return NextResponse.json({ error: 'Tour ID required' }, { status: 400 });
        }

        const updates: Partial<TourInput> = {};

        // Only include fields that are provided
        if ('title' in body) updates.title = body.title;
        if ('destination' in body) updates.destination = body.destination;
        if ('start_date' in body) updates.start_date = body.start_date;
        if ('end_date' in body) updates.end_date = body.end_date;
        if ('spots_total' in body) updates.spots_total = parseInt(body.spots_total);
        if ('spots_left' in body) updates.spots_left = parseInt(body.spots_left);
        if ('highlights' in body) updates.highlights = Array.isArray(body.highlights) ? body.highlights : [];
        if ('description' in body) updates.description = body.description;
        if ('status' in body) updates.status = body.status;
        if ('featured' in body) updates.featured = !!body.featured;
        if ('brochure_url' in body) updates.brochure_url = body.brochure_url;
        if ('image_url' in body) updates.image_url = body.image_url;

        if (updates.start_date && updates.end_date && !isValidDateRange(updates.start_date, updates.end_date)) {
            return NextResponse.json({ error: 'End date cannot be before the start date' }, { status: 400 });
        }

        if (
            typeof updates.spots_left === 'number' &&
            typeof updates.spots_total === 'number' &&
            updates.spots_left > updates.spots_total
        ) {
            return NextResponse.json({ error: 'Spots left cannot exceed total spots' }, { status: 400 });
        }

        const result = await updateTour(id, updates);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            revalidatePath('/upcoming-tours', 'layout');
            await recordAuditTrail('UPDATE', 'TOUR', id, updates);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Update Error:', error);
        return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 });
    }
}

// PATCH: Update tour status
export async function PATCH(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, action } = await req.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'ID and action required' }, { status: 400 });
        }

        let result;
        switch (action) {
            case 'complete':
                result = await markTourCompleted(id);
                break;
            case 'sold-out':
                result = await markTourSoldOut(id);
                break;
            case 'reopen':
                result = await updateTour(id, { status: 'upcoming' });
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            revalidatePath('/upcoming-tours', 'layout');
            await recordAuditTrail('UPDATE', 'TOUR', id, { action });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Status Update Error:', error);
        return NextResponse.json({ error: 'Failed to update tour status' }, { status: 500 });
    }
}

// DELETE: Delete a tour
export async function DELETE(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Tour ID required' }, { status: 400 });
        }

        const result = await deleteTour(id);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            revalidatePath('/upcoming-tours', 'layout');
            await recordAuditTrail('DELETE', 'TOUR', id);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
    }
}
