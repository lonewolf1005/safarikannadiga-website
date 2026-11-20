import { UpcomingTours } from '@/components/sections/UpcomingTours';
import { Container } from '@/components/ui/Container';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour in seconds

export const metadata: Metadata = {
    title: 'Upcoming Wildlife Safari Tours & Departures | Kenya, Tanzania & Uganda',
    description: 'Join scheduled group departures and guided photography tours to Masai Mara, Serengeti, and Amboseli. Expert naturalists, limited vehicle seats.',
    alternates: {
        canonical: '/upcoming-tours',
    },
    openGraph: {
        title: 'Upcoming Wildlife Safari Tours & Departures | Safari Kannadiga',
        description: 'Join scheduled group departures and guided photography tours to Masai Mara, Serengeti, and Amboseli.',
        url: 'https://safarikannadiga.com/upcoming-tours',
    },
};

export default function UpcomingToursPage() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://safarikannadiga.com' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Upcoming Tours', 'item': 'https://safarikannadiga.com/upcoming-tours' }
        ]
    };

    return (
        <div className="pt-24 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="bg-neutral-cream py-12 mb-8">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Upcoming Tours</h1>
                        <p className="text-lg text-neutral-gray">
                            Join us on our scheduled group departures. Carefully planned itineraries at the best times for wildlife viewing.
                        </p>
                    </div>
                </Container>
            </div>

            <UpcomingTours />
        </div>
    );
}
