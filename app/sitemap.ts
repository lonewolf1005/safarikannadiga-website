import { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content';
import { getContinents } from '@/lib/gallery-cloud';
import { toSlug } from '@/lib/utils/slugify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://safarikannadiga.com';
    const now = new Date();

    // 1. High-priority core static pages (excluding redirecting /tours)
    const coreRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/upcoming-tours`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/testimonials`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/share-experience`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // 2. Dynamic tour package pages
    const tourContent = (getAllContent('tours') || []) as any[];
    const tourRoutes: MetadataRoute.Sitemap = tourContent.map((tour) => ({
        url: `${baseUrl}/tours/${tour.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    // 3. Dynamic Continents, Countries, and Locations from Gallery
    const galleryRoutes: MetadataRoute.Sitemap = [];
    try {
        const continents = await getContinents();

        continents.forEach((continent) => {
            // Continent level (e.g. /gallery/africa)
            galleryRoutes.push({
                url: `${baseUrl}/gallery/${continent.slug}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: 0.9,
            });

            // Group by country
            const countriesSet = new Set<string>();
            continent.locations.forEach((loc) => {
                const countrySlug = toSlug(loc.country || 'other-destinations');
                countriesSet.add(countrySlug);

                // Location level (e.g. /gallery/africa/kenya/masai-mara)
                galleryRoutes.push({
                    url: `${baseUrl}/gallery/${continent.slug}/${countrySlug}/${loc.slug}`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            });

            // Country level (e.g. /gallery/africa/kenya)
            countriesSet.forEach((countrySlug) => {
                galleryRoutes.push({
                    url: `${baseUrl}/gallery/${continent.slug}/${countrySlug}`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.85,
                });
            });
        });
    } catch (e) {
        console.error('Error generating gallery sitemap routes:', e);
    }

    return [...coreRoutes, ...tourRoutes, ...galleryRoutes];
}
