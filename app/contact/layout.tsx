import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Safari Kannadiga | Book African Safari & Photography Tours',
    description: 'Get in touch with Safari Kannadiga to curate your custom African wildlife safari, Great Migration tour, or photography expedition. Connect via WhatsApp or inquiry form.',
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        title: 'Contact Safari Kannadiga | Book African Safari & Photography Tours',
        description: 'Get in touch with Safari Kannadiga to curate your custom African wildlife safari or photography expedition.',
        url: 'https://safarikannadiga.com/contact',
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
