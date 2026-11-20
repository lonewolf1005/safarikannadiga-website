import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Traveler Reviews & Testimonials | African Wildlife Safari Experiences',
    description: 'Read verified 5-star traveler reviews and safari testimonials from guests who experienced Africa and India wildlife tours with Safari Kannadiga.',
    alternates: {
        canonical: '/testimonials',
    },
    openGraph: {
        title: 'Traveler Reviews & Testimonials | Safari Kannadiga',
        description: 'Read verified 5-star traveler reviews and safari testimonials from guests who experienced Africa and India wildlife tours with Safari Kannadiga.',
        url: 'https://safarikannadiga.com/testimonials',
    },
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
