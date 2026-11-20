'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'What makes Safari Kannadiga the premier choice for an African wildlife safari and photography vacation?',
        answer: 'Safari Kannadiga specializes in photographer-optimized and wildlife-focused expeditions. Unlike generic commercial tour operators that cram vehicles, our custom 4x4 open-roof safari land cruisers limit passenger capacity so every traveler has an unobstructed 360-degree window seat, beanbag mounts, and ample space for equipment. Led by veteran naturalists and award-winning wildlife photographers, our expeditions prioritize animal behavior tracking, optimal golden-hour lighting, and ethical positioning for unforgettable encounters.'
    },
    {
        question: 'When is the best time to book an Africa safari for the Great Migration?',
        answer: 'The world-famous Great Migration follows an annual cycle across the Serengeti-Mara ecosystem. The iconic Mara River crossings in Kenya’s Masai Mara are best witnessed between July and October. For the predator-rich calving season, Tanzania’s southern Serengeti is peak from December to March. For Uganda mountain gorilla trekking, the dry seasons of June to September and December to February provide the most comfortable forest hiking conditions.'
    },
    {
        question: 'Can beginners and non-photographers join your African safari expeditions?',
        answer: 'Yes! While our itineraries are crafted with photographer vantage points, over 40% of our travelers are wildlife enthusiasts, families, and solo vacationers who want an authentic, deep-dive African wilderness adventure. Our leaders provide gentle, hands-on camera guidance for beginners while ensuring all guests enjoy world-class luxury tented lodges, gourmet bush cuisine, and extraordinary game drives.'
    },
    {
        question: 'Which African countries and national parks does Safari Kannadiga explore?',
        answer: 'Our African safari portfolio encompasses the continent’s premier wildlife sanctuaries: Kenya (Masai Mara, Amboseli with Mount Kilimanjaro backdrops, Lake Nakuru, Ol Pejeta, Samburu), Tanzania (Serengeti, Ngorongoro Crater, Tarangire), Uganda (Bwindi Impenetrable National Park for Mountain Gorillas and Kibale for Chimpanzees), as well as Namibia and Madagascar. We also conduct select Indian tiger safaris in Bandhavgarh, Ranthambore, and Kabini.'
    },
    {
        question: 'How do I book an African safari package from India, the USA, the UK, or UAE?',
        answer: 'We cater to a global clientele from India, the United States, Europe, and the Middle East. You can schedule a direct consultation with our expedition planners via WhatsApp or email. We curate complete end-to-end luxury safari packages: private airport transfers, domestic bush charter flights, premium safari lodge bookings, 4x4 land cruiser expeditions with dedicated naturalist drivers, all national park fees, and yellow fever/visa guidance.'
    },
    {
        question: 'What camera gear and lenses are recommended for African wildlife photography?',
        answer: 'We recommend a telephoto zoom such as a 100-400mm or 150-600mm for daytime versatility, complemented by a fast 70-200mm f/2.8 or prime lens (300mm/500mm) for early morning and late evening predator action. Having two camera bodies eliminates the need to change lenses in dusty conditions. We equip all safari vehicles with beanbags, clamping mounts, and charging inverter points.'
    }
];

export function SafariFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };

    return (
        <section className="section-padding bg-neutral-cream border-t border-gray-100" id="safari-faqs">
            <Container>
                {/* Schema Markup for Generative AI & Google Rich Snippets */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />

                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-3 block">
                        Everything You Need To Know
                    </span>
                    <h2 className="text-display text-neutral-charcoal mb-6">
                        Africa Safari & Wildlife Photography FAQs
                    </h2>
                    <p className="text-neutral-gray text-base md:text-lg">
                        Planning an African vacation or wildlife photography tour? Here are answers to common questions about seasons, itineraries, gear, and booking with Safari Kannadiga.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-neutral-charcoal hover:text-safari-gold transition-colors text-base md:text-lg"
                                    aria-expanded={isOpen}
                                >
                                    <span>{faq.question}</span>
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-neutral-cream transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 bg-safari-gold text-white' : 'text-neutral-gray'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-6 pb-6 pt-1 text-neutral-gray text-sm md:text-base leading-relaxed border-t border-gray-50 animate-fade-in">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
