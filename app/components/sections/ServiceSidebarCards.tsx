'use client';

import React from 'react';
import Link from 'next/link';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';

interface OtherServicesCardProps {
    otherServices: any[];
}

interface QuickContactCardProps {
    service: any;
}

export const OtherServicesCard: React.FC<OtherServicesCardProps> = ({ otherServices }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    // Utility function to get full image URL
    const getFullImageUrl = (url?: string): string | undefined => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return url;
        if (url.startsWith('/')) return url;
        return `/uploads/${url}`;
    };

    if (otherServices.length === 0) return null;

    return (
        <div 
            className="rounded-2xl border p-6"
            style={{
                backgroundColor: themeColors.cardBackgroundDark,
                borderColor: `${themeColors.inactive}30`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
        >
            <h3 
                className="text-lg font-semibold mb-4"
                style={{ 
                    color: themeColors.lightPrimaryText,
                }}
            >
                Other Services
            </h3>
            <ul className="space-y-3">
                {otherServices.map((otherService: any) => (
                    <li key={otherService._id}>
                        <Link
                            href={`/service/${otherService.slug}`}
                            className="group flex items-center gap-3 p-2 rounded-lg transition-colors"
                            style={{ 
                                backgroundColor: 'transparent' 
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${themeColors.inactive}20`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {otherService.thumbnailImage?.url && (
                                <img
                                    src={getFullImageUrl(otherService.thumbnailImage.url) || ''}
                                    alt={otherService.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                />
                            )}
                            <span
                                className="text-sm font-medium group-hover:underline"
                                style={{ color: themeColors.lightPrimaryText }}
                            >
                                <TiptapRenderer content={otherService.name} as="inline" />
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            
            {/* View All Services Link */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: `${themeColors.inactive}20` }}>
                <Link
                    href="/contact-us"
                    className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        backgroundColor: themeColors.primaryButton,
                        color: '#FFFFFF',
                    }}
                >
                    Explore More
                    <svg 
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export const QuickContactCard: React.FC<QuickContactCardProps> = ({ service }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    return (
        <div
            className="rounded-2xl border p-6"
            style={{
                backgroundColor: themeColors.cardBackground,
                borderColor: `${themeColors.inactive}30`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
        >
            <h3
                className="text-lg font-semibold mb-2"
                style={{
                    color: themeColors.lightPrimaryText,
                }}
            >
                Need Help?
            </h3>
            <p
                className="text-sm mb-4"
                style={{ color: themeColors.secondaryText }}
            >
                Contact us for a free consultation about <TiptapRenderer content={service.name} as="inline" />.
            </p>
            <Link
                href="/contact-us"
                className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{
                    backgroundColor: themeColors.primaryButton,
                    color: '#FFFFFF',
                }}
            >
                Get in Touch
            </Link>
        </div>
    );
};
