import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { BackToTop } from '@/components/ui/BackToTop';
import { Preloader } from '@/components/ui/Preloader';
import { getGeneralSettings } from '@/lib/content';
import { ImageProtectionProvider } from '@/components/providers/ImageProtectionProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Safari Kannadiga | Africa Wildlife Safari Tours & Photography Expeditions',
        template: '%s | Safari Kannadiga',
    },
    description: 'Premier wildlife safari tours and photography expeditions in Africa and India. Book curated Kenya Masai Mara safaris, Tanzania Serengeti migrations, Uganda gorilla trekking, and photography workshops with expert naturalists.',
    keywords: [
        // Core Africa Safari & Vacation
        'africa safari', 'african safari tours', 'vacation in africa', 'best africa safari vacation',
        'africa safari packages', 'luxury africa safari', 'african wildlife safari', 'africa holiday packages',
        'safari in africa', 'africa tour operators', 'africa travel packages',
        // Photography & Expeditions
        'photography in africa', 'wildlife photography safari', 'africa photography tour', 
        'wildlife photography expedition', 'best wildlife photography tours', 'safari photography workshop',
        'photo safari africa', 'kenya photography safari', 'wildlife photography mentorship',
        // Destinations (Kenya, Tanzania, Uganda, Namibia, Madagascar)
        'kenya safari', 'kenya safari booking', 'masai mara safari', 'great migration safari kenya',
        'amboseli national park safari', 'tanzania safari', 'serengeti safari', 'ngorongoro crater safari',
        'uganda gorilla trekking', 'kibale chimpanzee tracking', 'namibia wildlife safari', 'madagascar wildlife tour',
        // Asia & India
        'india wildlife tour', 'tiger safari india', 'bandhavgarh tiger safari', 'kabini wildlife safari', 'ranthambore safari',
        // Brand & Regional Intent
        'safari kannadiga', 'safarikannadiga', 'safari kannadiga tours', 'tilak safari kannadiga',
        'african safari from india', 'african safari booking bangalore', 'indian safari operator in kenya'
    ],
    authors: [{ name: 'SafariKannadiga', url: 'https://safarikannadiga.com' }],
    creator: 'SafariKannadiga',
    metadataBase: new URL('https://safarikannadiga.com'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        alternateLocale: ['en_IN', 'en_GB'],
        url: 'https://safarikannadiga.com',
        siteName: 'Safari Kannadiga',
        title: 'Safari Kannadiga | Africa Wildlife Safari Tours & Photography Expeditions',
        description: 'Bespoke expert-led wildlife photography safaris and luxury African vacation tours in Kenya, Tanzania, Uganda, Namibia, and India.',
        images: [
            {
                url: '/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Safari Kannadiga African Wildlife & Photography Expedition',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Safari Kannadiga | Africa Wildlife Safari Tours & Photography Expeditions',
        description: 'Bespoke expert-led wildlife photography safaris and luxury African vacation tours.',
        images: ['/images/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'DZldsNSBcZs1NA4vRbxV8FK5v2KPI79D8r2R8sdr18Y',
    },
    other: {
        'geo.region': 'KE;TZ;UG;IN',
        'geo.placename': 'Nairobi; Masai Mara; Serengeti; Bengaluru',
        'ICBM': '-1.2921, 36.8219',
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getGeneralSettings();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'TravelAgency',
                '@id': 'https://safarikannadiga.com/#travelagency',
                'name': 'Safari Kannadiga',
                'alternateName': ['Safari Kannadiga Wildlife Tours', 'SafariKannadiga'],
                'url': 'https://safarikannadiga.com',
                'logo': 'https://safarikannadiga.com/images/SK_logo/SK_Logo.png',
                'image': 'https://safarikannadiga.com/images/og-image.jpg',
                'description': 'Premier wildlife safari and photography expedition operator organizing bespoke tours across Kenya, Tanzania, Uganda, Namibia, Madagascar, and India.',
                'telephone': '+91-9900000000',
                'email': 'hello@safarikannadiga.com',
                'priceRange': '$$$$',
                'currenciesAccepted': 'USD, INR, EUR, GBP',
                'paymentAccepted': 'Credit Card, Bank Transfer, Online Payment',
                'areaServed': [
                    { '@type': 'Place', 'name': 'Kenya' },
                    { '@type': 'Place', 'name': 'Tanzania' },
                    { '@type': 'Place', 'name': 'Uganda' },
                    { '@type': 'Place', 'name': 'Namibia' },
                    { '@type': 'Place', 'name': 'Madagascar' },
                    { '@type': 'Place', 'name': 'India' },
                    { '@type': 'Place', 'name': 'Worldwide' }
                ],
                'knowsAbout': [
                    'African Safari Planning',
                    'Wildlife Photography Expeditions',
                    'Great Wildebeest Migration',
                    'Big Five Wildlife Safaris',
                    'Gorilla Trekking in Uganda',
                    'Serengeti & Masai Mara Tours',
                    'Indian Tiger Safaris'
                ],
                'sameAs': [
                    'https://www.instagram.com/safarikannadiga',
                    'https://www.facebook.com/safarikannadiga'
                ],
                'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': '5.0',
                    'reviewCount': '24',
                    'bestRating': '5',
                    'worstRating': '1'
                }
            },
            {
                '@type': 'WebSite',
                '@id': 'https://safarikannadiga.com/#website',
                'url': 'https://safarikannadiga.com',
                'name': 'Safari Kannadiga',
                'publisher': { '@id': 'https://safarikannadiga.com/#travelagency' },
                'inLanguage': 'en-US'
            }
        ]
    };

    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="flex min-h-screen flex-col">
                <Preloader />
                <ImageProtectionProvider />
                <Header settings={settings} />
                <main className="flex-grow animate-fade-in">{children}</main>
                <Footer settings={settings} />
                <BackToTop />
                <WhatsAppButton />
            </body>
        </html>
    );
}
