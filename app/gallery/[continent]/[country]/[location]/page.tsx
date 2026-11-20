
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { getContinents, getContinent, getLocation, getImages } from '@/lib/gallery-cloud';
import GalleryLocationClient from '@/components/gallery/GalleryLocationClient';
import { toSlug } from '@/lib/utils/slugify';

// Force dynamic rendering to ensure cover photo changes reflect immediately
// Enable ISR with 1-hour cache
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ continent: string; country: string; location: string }> }): Promise<Metadata> {
    const { continent: continentSlug, country: countrySlug, location: locationSlug } = await params;
    const location = await getLocation(continentSlug, locationSlug);
    if (!location) return { title: 'Wildlife Photo Gallery' };

    const countryName = location.country || countrySlug.replace(/-/g, ' ');
    const title = `${location.name} Wildlife Photography & Safari Gallery | ${countryName}`;
    const wildlifeList = location.wildlife && location.wildlife.length > 0 ? ` featuring ${location.wildlife.slice(0, 4).join(', ')}` : '';
    const description = `View high-resolution wildlife photos captured in ${location.name}, ${countryName}${wildlifeList}. Expert-guided photographic safaris by Safari Kannadiga.`;

    const coverUrl = location.coverImage && !location.coverImage.includes('placeholder') ? location.coverImage : undefined;

    return {
        title,
        description,
        openGraph: {
            title: `${title} | Safari Kannadiga`,
            description,
            url: `https://safarikannadiga.com/gallery/${continentSlug}/${countrySlug}/${locationSlug}`,
            images: coverUrl ? [{ url: coverUrl, alt: `${location.name} Wildlife Photography` }] : undefined,
        },
        alternates: {
            canonical: `/gallery/${continentSlug}/${countrySlug}/${locationSlug}`,
        },
    };
}

// Generate static params for all locations at build time
export async function generateStaticParams() {
    const continents = await getContinents();
    const params: { continent: string; country: string; location: string }[] = [];

    continents.forEach((continent) => {
        continent.locations.forEach((location) => {
            const countrySlug = toSlug(location.country || 'other-destinations');
            params.push({
                continent: continent.slug,
                country: countrySlug,
                location: location.slug,
            });
        });
    });

    return params;
}

export default async function LocationGalleryPage({ params }: { params: Promise<{ continent: string; country: string; location: string }> }) {
    const { continent: continentSlug, country: countrySlug, location: locationSlug } = await params;

    const continent = await getContinent(continentSlug);
    const location = await getLocation(continentSlug, locationSlug);

    if (!continent || !location) return notFound();

    // STRICT VALIDATION: Ensure the route country matches the location's actual country
    const actualCountrySlug = toSlug(location.country || 'other-destinations');
    if (actualCountrySlug !== countrySlug) {
        return notFound(); // Prevent accessing via wrong country URL
    }

    const images = await getImages(continentSlug, locationSlug);
    const coverImage = location.coverImage || '/images/placeholder-safari.jpg';

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://safarikannadiga.com' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Gallery', 'item': 'https://safarikannadiga.com/gallery' },
            { '@type': 'ListItem', 'position': 3, 'name': continent.name, 'item': `https://safarikannadiga.com/gallery/${continentSlug}` },
            { '@type': 'ListItem', 'position': 4, 'name': location.country || 'Destinations', 'item': `https://safarikannadiga.com/gallery/${continentSlug}/${countrySlug}` },
            { '@type': 'ListItem', 'position': 5, 'name': location.name, 'item': `https://safarikannadiga.com/gallery/${continentSlug}/${countrySlug}/${locationSlug}` }
        ]
    };

    const destinationSchema = {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        'name': location.name,
        'description': location.description,
        'containedInPlace': {
            '@type': 'Country',
            'name': location.country || continent.name
        },
        'image': coverImage,
        'touristType': ['Wildlife Enthusiasts', 'Nature Photographers', 'Safari Travelers'],
        'includesAttraction': location.wildlife?.map(animal => ({
            '@type': 'TouristAttraction',
            'name': `${animal} in ${location.name}`
        }))
    };

    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationSchema) }}
            />
            <Container>
                {/* Breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-gray">
                        <Link href="/gallery" className="hover:text-safari-gold transition-colors">Gallery</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <Link href={`/gallery/${continentSlug}`} className="hover:text-safari-gold transition-colors">{continent.name}</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <Link href={`/gallery/${continentSlug}/${countrySlug}`} className="hover:text-safari-gold transition-colors">{location.country || 'Other'}</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-safari-gold">{location.name}</span>
                    </div>
                </div>

                {/* Location Header */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div>
                        <span className="text-safari-gold text-sm font-bold uppercase tracking-wider block mb-2">
                            {location.country}
                        </span>
                        <h1 className="text-display mb-6">{location.name}</h1>
                        <p className="text-neutral-gray text-lg leading-relaxed mb-6">
                            {location.description}
                        </p>

                        {/* Wildlife Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {location.wildlife.map((animal) => (
                                <span
                                    key={animal}
                                    className="text-xs uppercase font-bold tracking-wider text-forest-green bg-forest-green/10 px-3 py-1 rounded-full"
                                >
                                    {animal}
                                </span>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-8 pt-4 border-t border-neutral-gray/20">
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">{images.length}</p>
                                <p className="text-sm text-neutral-gray">Photos</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">{continent.name}</p>
                                <p className="text-sm text-neutral-gray">Continent</p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-xl">
                        <Image
                            src={coverImage}
                            alt={location.name}
                            fill
                            style={{
                                objectPosition: `${location.focalX || 50}% ${location.focalY || 50}%`,
                                transform: `scale(${location.zoom || 1.0})`
                            }}
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                </div>

                {/* Photo Gallery */}
                <GalleryLocationClient
                    images={images.map(img => ({
                        src: img.src,
                        filename: img.filename,
                        alt: img.alt,
                        publicId: img.publicId
                    }))}
                    title={location.name}
                />

                {/* Share Experience CTA */}
                <div className="mt-16 bg-forest-green text-white p-8 md:p-12 rounded-card text-center">
                    <h3 className="text-h2 text-white mb-4">Been to {location.name}?</h3>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                        Share your experience and help fellow wildlife enthusiasts plan their adventure.
                        Your stories inspire others to explore the wild.
                    </p>
                    <Link
                        href="/share-experience"
                        className="inline-flex items-center gap-2 bg-safari-gold text-white px-8 py-3 rounded-full font-bold hover:bg-safari-gold-dark transition-colors"
                    >
                        Share Your Experience
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </Container>
        </section>
    );
}
