import { NextResponse } from 'next/server';
import { getApprovedTestimonials, createTestimonial, TestimonialInput } from '@/lib/testimonials';

export const maxDuration = 60;

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = MAX_PHOTOS * MAX_FILE_SIZE_BYTES;
const MAX_NAME_LENGTH = 100;
const MAX_SAFARI_LENGTH = 150;
const MAX_STORY_LENGTH = 5000;
const MAX_HIGHLIGHTS_LENGTH = 500;

// GET: List approved testimonials (public)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        const testimonials = await getApprovedTestimonials(limit ? parseInt(limit) : undefined);

        // Short cache to balance fast reflection with Firestore protection
        const response = NextResponse.json(testimonials);
        response.headers.set(
            'Cache-Control',
            'public, s-maxage=60, stale-while-revalidate=300'
        );
        return response;
    } catch (error) {
        console.error('Testimonials Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

// POST: Submit a new testimonial (public)
export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        
        let data: TestimonialInput;
        let photos: File[] | string[] = [];
        let customSpamTrap: string | null = null;
        let consent = false;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            customSpamTrap = body.custom_spam_trap_website_null || null;
            consent = !!body.consent;
            data = {
                name: body.name,
                email: body.email,
                safari: body.safari,
                visit_date: body.visit_date || undefined,
                rating: parseInt(body.rating) || 5,
                story: body.story,
                highlights: body.highlights || undefined,
            };
            photos = Array.isArray(body.photos) ? body.photos : [];
        } else {
            // Fallback for multipart form-data
            let formData: FormData;
            try {
                formData = await req.formData();
            } catch (error) {
                console.error('Testimonial FormData Parse Error:', error);
                return NextResponse.json(
                    { error: 'Upload payload too large. Please upload smaller photos and try again.' },
                    { status: 413 }
                );
            }

            customSpamTrap = formData.get('custom_spam_trap_website_null') as string | null;
            consent = formData.get('consent') === 'true';
            data = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                safari: formData.get('safari') as string,
                visit_date: formData.get('visit_date') as string || undefined,
                rating: parseInt(formData.get('rating') as string) || 5,
                story: formData.get('story') as string,
                highlights: formData.get('highlights') as string || undefined,
            };

            // Extract photos (max 5)
            const filePhotos: File[] = [];
            for (let i = 0; i < MAX_PHOTOS; i++) {
                const photo = formData.get(`photo_${i}`) as File | null;
                if (photo && photo.size > 0) {
                    filePhotos.push(photo);
                }
            }

            // Also check for 'photos' field (array upload)
            const photosField = formData.getAll('photos') as File[];
            if (photosField.length > 0) {
                filePhotos.push(...photosField.slice(0, MAX_PHOTOS - filePhotos.length));
            }
            photos = filePhotos;
        }

        // Anti-spam Honeypot Check
        if (customSpamTrap) {
            // Silently succeed for bots
            return NextResponse.json({
                success: true,
                id: 'honeypot-bot-submission',
                message: 'Thank you for sharing your experience! Your testimonial will be reviewed and published soon.'
            });
        }

        // Validate required fields
        if (!data.name || !data.email || !data.safari || !data.story) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!consent) {
            return NextResponse.json({ error: 'Consent to publish is required' }, { status: 400 });
        }

        // Validate rating
        if (data.rating < 1 || data.rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        if (data.name.length > MAX_NAME_LENGTH) {
            return NextResponse.json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }, { status: 400 });
        }
        if (data.safari.length > MAX_SAFARI_LENGTH) {
            return NextResponse.json({ error: `Safari name must be ${MAX_SAFARI_LENGTH} characters or fewer` }, { status: 400 });
        }
        if (data.story.length > MAX_STORY_LENGTH) {
            return NextResponse.json({ error: `Story must be ${MAX_STORY_LENGTH} characters or fewer` }, { status: 400 });
        }
        if (data.highlights && data.highlights.length > MAX_HIGHLIGHTS_LENGTH) {
            return NextResponse.json({ error: `Highlights must be ${MAX_HIGHLIGHTS_LENGTH} characters or fewer` }, { status: 400 });
        }

        // Limit to 5 photos
        if (photos.length > MAX_PHOTOS) {
            return NextResponse.json({ error: 'Maximum 5 photos allowed' }, { status: 400 });
        }

        // If files, validate size and type
        if (photos.length > 0 && typeof photos[0] !== 'string') {
            const filePhotos = photos as File[];
            let totalUploadBytes = 0;
            for (const photo of filePhotos) {
                if (!photo.type.startsWith('image/')) {
                    return NextResponse.json({ error: `Invalid file type: ${photo.name}` }, { status: 400 });
                }

                if (photo.size > MAX_FILE_SIZE_BYTES) {
                    return NextResponse.json(
                        { error: `${photo.name} is too large. Maximum allowed size is 10MB per photo.` },
                        { status: 400 }
                    );
                }

                totalUploadBytes += photo.size;
            }

            if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
                return NextResponse.json(
                    { error: 'Total photo upload size is too large. Please keep all selected photos within the allowed limits.' },
                    { status: 400 }
                );
            }
        }

        const result = await createTestimonial(data, photos);

        if (result.success) {
            return NextResponse.json({
                success: true,
                id: result.id,
                message: 'Thank you for sharing your experience! Your testimonial will be reviewed and published soon.'
            });
        } else {
            const errorMessage = result.error || 'Failed to submit testimonial';
            const normalizedError = errorMessage.toLowerCase();

            let status = 500;
            if (normalizedError.includes('payload too large')) status = 413;
            if (
                normalizedError.includes('database not configured') ||
                normalizedError.includes('service role') ||
                normalizedError.includes('row-level security') ||
                normalizedError.includes('permission denied')
            ) {
                status = 503;
            }

            return NextResponse.json({ error: errorMessage }, { status });
        }
    } catch (error) {
        console.error('Testimonial Submit Error:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        if (/payload|body|too large|size limit|exceeded/i.test(message)) {
            return NextResponse.json(
                { error: 'Upload payload too large. Please upload smaller photos and try again.' },
                { status: 413 }
            );
        }

        return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 });
    }
}
