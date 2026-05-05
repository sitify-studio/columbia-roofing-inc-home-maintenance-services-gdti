'use client';

import React, { useState } from 'react';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';

interface ServiceFAQSectionProps {
    service: any;
}

// Get contrast color for text on backgrounds
const getContrastColor = (bgColor: string, fallback: string) => {
    if (!bgColor || bgColor === 'transparent') return fallback;
    const color = bgColor.toLowerCase();
    
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        if (hex.length === 3) {
            const r = parseInt(hex[0], 16) * 17;
            const g = parseInt(hex[1], 16) * 17;
            const b = parseInt(hex[2], 16) * 17;
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness < 128) return '#FFFFFF';
        } else if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness < 128) return '#FFFFFF';
        }
    }
    
    if (color.includes('dark') || color.includes('black') || 
        color.includes('#000') || color.includes('#111') || color.includes('#222') || 
        color.includes('#333') || color.includes('#444') || color.includes('#555')) {
        return '#FFFFFF';
    }
    
    return fallback;
};

export const ServiceFAQSection: React.FC<ServiceFAQSectionProps> = ({ service }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();
    const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

    // FAQ toggle handler
    const toggleFaq = (index: number) => {
        setActiveFaqIndex(activeFaqIndex === index ? null : index);
    };

    // Service FAQ items
    const serviceFaqs = service.faqs || [];
    const hasFaqs = serviceFaqs.length > 0;

    if (!hasFaqs) return null;

    return (
        <section
            className="py-16 lg:py-24"
            style={{ backgroundColor: themeColors.sectionBackground }}
        >
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Left column - Title */}
                    <div className="lg:col-span-5">
                        <h2
                            className="text-4xl lg:text-5xl font-semibold leading-tight"
                            style={{ 
                                color: themeColors.lightPrimaryText 
                            }}
                        >
                            Frequently Asked Questions
                        </h2>
                        <p
                            className="mt-4 max-w-md text-sm leading-relaxed"
                            style={{ 
                                color: themeColors.lightSecondaryText 
                            }}
                        >
                            Get answers to common questions about our {service.name} service.
                        </p>
                    </div>

                    {/* Right column - FAQ Items */}
                    <div className="lg:col-span-7">
                        <div
                            className="rounded-2xl border overflow-hidden"
                            style={{
                                backgroundColor: themeColors.cardBackgroundDark,
                                borderColor: `${themeColors.inactive}30`,
                                boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
                            }}
                        >
                            {serviceFaqs.map((faq: any, index: number) => {
                                const isOpen = activeFaqIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="px-6 py-5 border-b last:border-b-0"
                                        style={{ borderColor: `${themeColors.inactive}22` }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex items-start justify-between gap-6 text-left"
                                        >
                                            <div
                                                className="text-sm font-medium"
                                                style={{ 
                                                    color: themeColors.lightPrimaryText 
                                                }}
                                            >
                                                {faq.question}
                                            </div>

                                            <span
                                                className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border shrink-0"
                                                style={{
                                                    borderColor: themeColors.lightPrimaryText,
                                                    backgroundColor: isOpen ? `${themeColors.primaryButton}55` : 'transparent',
                                                    color: themeColors.lightPrimaryText,
                                                }}
                                                aria-hidden="true"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    {isOpen ? (
                                                        <path d="M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
                                                    ) : (
                                                        <>
                                                            <path d="M12 6v12" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
                                                        </>
                                                    )}
                                                </svg>
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div
                                                className="mt-3 pr-10 text-sm leading-relaxed"
                                                style={{ 
                                                    color: themeColors.lightSecondaryText 
                                                }}
                                            >
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
