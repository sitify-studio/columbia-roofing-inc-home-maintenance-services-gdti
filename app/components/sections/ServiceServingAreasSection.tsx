'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ServiceServingAreasSectionProps {
    service: any;
}

export const ServiceServingAreasSection: React.FC<ServiceServingAreasSectionProps> = ({ service }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();
    const { site, serviceAreaPages } = useWebBuilder();
    
    // Dropdown state for service areas
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current);
            }
        };
    }, []);

    const areas = useMemo(() => {
        const serviceAreas = service.serviceAreas || [];
        const siteAreas = Array.isArray(site?.serviceAreas) ? site!.serviceAreas.filter(Boolean) : [];
        
        // Use service-specific areas if available, otherwise fall back to site areas
        return (Array.isArray(serviceAreas) && serviceAreas.length > 0)
            ? serviceAreas
            : siteAreas;
    }, [service.serviceAreas, site?.serviceAreas, serviceAreaPages]);

    if (areas.length === 0) return null;

    // Generate service slug from service name
    const serviceSlug = String(service.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const resolvedTitle = `Serving Areas`;
    const resolvedDescription = `We provide ${service.name} services in the following areas`;

    return (
        <section
            className="py-16 lg:py-24"
            style={{ backgroundColor: themeColors.sectionBackground }}
        >
            <div className="container mx-auto px-4">
                {(resolvedTitle || resolvedDescription) && (
                    <div className="text-center mb-10">
                        {resolvedTitle && (
                            <h2
                                className="text-3xl sm:text-4xl lg:text-5xl font-semibold"
                                style={{ color: themeColors.lightPrimaryText }}
                            >
                                {resolvedTitle}
                            </h2>
                        )}
                        {resolvedDescription && (
                            <div
                                className="mt-4 text-base"
                                style={{ color: themeColors.lightSecondaryText }}
                            >
                                {resolvedDescription}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-center gap-6 mb-10">
                    <div className="h-px w-32 sm:w-56" style={{ backgroundColor: `${themeColors.inactive}55` }} />
                    <div
                        className="h-10 w-10 rounded-full border flex items-center justify-center"
                        style={{ borderColor: `${themeColors.inactive}55`, color: themeColors.lightPrimaryText, backgroundColor: themeColors.cardBackground }}
                        aria-hidden="true"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 4l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 4l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 10l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18 10l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 18l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 18l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="h-px w-32 sm:w-56" style={{ backgroundColor: `${themeColors.inactive}55` }} />
                </div>

                <div className="max-w-6xl mx-auto">
                    <div
                        className="flex justify-center gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        <style jsx>{`
                            div::-webkit-scrollbar { display: none; }
                        `}</style>
                        {areas.map((area: any, idx) => {
                            const cityName = typeof area === 'string' ? area : area.city;
                            const regionName = typeof area === 'string' ? '' : (area.region || '');
                            const citySlug = regionName 
                                ? `${String(cityName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${String(regionName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
                                : String(cityName)
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/^-|-$/g, '');
                            
                            const areaKey = `${cityName}-${idx}`;

                            return (
                                <div
                                    key={areaKey}
                                    className="relative"
                                    onMouseEnter={() => {
                                        // Clear any existing timeout
                                        if (dropdownTimeoutRef.current) {
                                            clearTimeout(dropdownTimeoutRef.current);
                                        }
                                        setHoveredArea(areaKey);
                                    }}
                                    onMouseLeave={() => {
                                        // Add delay before closing dropdown
                                        dropdownTimeoutRef.current = setTimeout(() => {
                                            setHoveredArea(null);
                                        }, 200);
                                    }}
                                >
                                    <Link
                                        href={`/service/${serviceSlug}/service-areas/${citySlug}`}
                                        className="group inline-flex items-center gap-2 whitespace-nowrap transition-colors"
                                        style={{
                                            color: themeColors.lightPrimaryText,
                                        }}
                                    >
                                        <span style={{ color: themeColors.hoverActive }} aria-hidden="true">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 21s-7-4.5-7-11a7 7 0 1 1 14 0c0 6.5-7 11-7 11z" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="10" r="2.5" />
                                            </svg>
                                        </span>
                                        <span className="text-base font-medium" style={{ scrollSnapAlign: 'start' }}>
                                            {cityName}{typeof area !== 'string' && area.region ? `, ${area.region}` : ''}
                                        </span>
                                        {/* Add dropdown arrow indicator */}
                                        <svg 
                                            className="w-3 h-3 transition-transform duration-200" 
                                            style={{ 
                                                color: themeColors.hoverActive,
                                                transform: hoveredArea === areaKey ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                    
                                    {/* Dropdown Menu */}
                                    {hoveredArea === areaKey && (
                                        <div 
                                            className="absolute top-full left-0 mt-2 w-56 sm:w-64 rounded-2xl shadow-2xl border py-3 z-50 backdrop-blur-xl"
                                            style={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                borderColor: `${themeColors.primaryButton}20`
                                            }}
                                            onMouseEnter={() => {
                                                // Clear any existing timeout when entering dropdown
                                                if (dropdownTimeoutRef.current) {
                                                    clearTimeout(dropdownTimeoutRef.current);
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                // Add delay before closing when leaving dropdown
                                                dropdownTimeoutRef.current = setTimeout(() => {
                                                    setHoveredArea(null);
                                                }, 200);
                                            }}
                                        >
                                            <div 
                                                className="px-5 py-2 text-xs font-black uppercase tracking-[0.3em] border-b"
                                                style={{ 
                                                    color: themeColors.primaryButton,
                                                    borderColor: `${themeColors.primaryButton}20`,
                                                    fontFamily: themeFonts.body
                                                }}
                                            >
                                                Quick Actions
                                            </div>
                                            
                                            {/* Dropdown Actions */}
                                            <div className="py-2">
                                                <Link
                                                    href={`/service/${serviceSlug}/service-areas/${citySlug}`}
                                                    className="block px-5 py-3 transition-all duration-300 hover:bg-gray-50"
                                                    style={{ 
                                                        color: themeColors.darkSecondaryText,
                                                        fontFamily: themeFonts.body
                                                    }}
                                                >
                                                    <span className="text-sm font-medium">View Service Area Details</span>
                                                </Link>
                                                
                                                <Link
                                                    href={`/contact`}
                                                    className="block px-5 py-3 transition-all duration-300 hover:bg-gray-50"
                                                    style={{ 
                                                        color: themeColors.darkSecondaryText,
                                                        fontFamily: themeFonts.body
                                                    }}
                                                >
                                                    <span className="text-sm font-medium">Schedule Service in {cityName}</span>
                                                </Link>
                                                
                                                <Link
                                                    href={`/service/${serviceSlug}`}
                                                    className="block px-5 py-3 transition-all duration-300 hover:bg-gray-50"
                                                    style={{ 
                                                        color: themeColors.darkSecondaryText,
                                                        fontFamily: themeFonts.body
                                                    }}
                                                >
                                                    <span className="text-sm font-medium">Learn More About {service.name}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
