'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { MapPin } from 'lucide-react';

interface ServiceServingAreasSectionProps {
    service: any;
}

export const ServingAreas: React.FC<ServiceServingAreasSectionProps> = ({ service }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();
    const { site } = useWebBuilder();

    const areas = useMemo(() => {
        // Try multiple data sources to find service areas
        let siteAreas: any[] = [];
        let serviceAreas: any[] = [];
        
        // Get site areas
        if (Array.isArray(site?.serviceAreas)) {
            siteAreas = site.serviceAreas.filter(Boolean);
        }
        
        // Get service areas from different possible locations
        if (service?.serviceAreas && Array.isArray(service.serviceAreas)) {
            serviceAreas = service.serviceAreas;
        } else if (service?.areas && Array.isArray(service.areas)) {
            serviceAreas = service.areas;
        } else if (Array.isArray(service)) {
            // If service itself is an array of areas
            serviceAreas = service;
        }
        
        // Use service-specific areas if available, otherwise fall back to site areas
        const finalAreas = serviceAreas.length > 0 ? serviceAreas : siteAreas;
        
        // Clean up area strings (remove extra spaces)
        const cleanedAreas = finalAreas.map(area => {
            if (typeof area === 'string') {
                return area.trim();
            }
            return area;
        });
        
        return cleanedAreas;
    }, [service, site?.serviceAreas]);

    // Always try to render if we have areas, even if service is null
    if (areas.length === 0) {
        return (
            <div className="py-16 text-center" style={{ color: themeColors.lightPrimaryText }}>
                No service areas available
            </div>
        );
    }

    // Generate service slug from service name or use a default
    const serviceSlug = service?.name ? 
        String(service.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') : 
        'service';

    const resolvedTitle = `Serving Areas`;
    const resolvedDescription = service?.name ? 
        `We provide ${service.name} services in the following areas` : 
        'We provide services in the following areas';

    return (
        <section
            className={cn('py-24 lg:py-32')}
            style={{ backgroundColor: themeColors.sectionBackground }}
        >
            <div className="container mx-auto px-6">
                
                {/* Editorial Header Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div className="max-w-2xl">
                        {/* Heritage Label */}
                        <div className="mb-6 flex items-center gap-3">
                            <span 
                                className="text-[10px] tracking-[0.4em] uppercase font-bold"
                                style={{ color: themeColors.primaryButton }}
                            >
                                OUR REACH
                            </span>
                            <div className="w-12 h-[1px]" style={{ backgroundColor: `${themeColors.primaryButton}40` }} />
                        </div>

                        {resolvedTitle && (
                            <h2
                                className="text-5xl lg:text-7xl font-serif leading-tight"
                                style={{ color: themeColors.lightPrimaryText }}
                            >
                                {resolvedTitle}
                            </h2>
                        )}
                    </div>

                    {resolvedDescription && (
                        <div
                            className="max-w-sm text-lg font-light leading-relaxed opacity-70"
                            style={{ color: themeColors.lightSecondaryText }}
                        >
                            {resolvedDescription}
                        </div>
                    )}
                </div>

                {/* Areas Display - Clean Architectural Layout */}
                <div className="max-w-7xl">
                    <div className="flex flex-wrap gap-y-8 sm:gap-y-12 gap-x-8 sm:gap-x-12 lg:gap-x-16 border-t pt-12 sm:pt-16" style={{ borderColor: `${themeColors.inactive}30` }}>
                        {areas.map((area: any, idx: number) => {
                            const cityName = typeof area === 'string' ? area : area.city;
                            const citySlug = String(cityName)
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '');

                            return (
                                <div key={`${cityName}-${idx}`} className="group relative">
                                    <Link
                                        href={`/service/${serviceSlug}/service-areas/${citySlug}`}
                                        className="flex flex-col gap-4 transition-all duration-500"
                                        style={{}}
                                    >
                                        {/* Indexing Number */}
                                        <span 
                                            className="text-[10px] font-bold tracking-tighter opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                            style={{ color: themeColors.primaryButton }}
                                        >
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-2xl lg:text-3xl font-serif transition-colors"
                                                style={{ color: themeColors.lightPrimaryText }}
                                            >
                                                {cityName}
                                            </span>
                                            <MapPin 
                                                className="w-4 h-4 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500" 
                                                style={{ color: themeColors.primaryButton }}
                                            />
                                        </div>
                                        
                                        {/* Region if available */}
                                        {typeof area !== 'string' && area.region && (
                                            <span 
                                                className="text-sm opacity-70"
                                                style={{ color: themeColors.lightSecondaryText }}
                                            >
                                                {area.region}
                                            </span>
                                        )}
                                        
                                        {/* Minimal hover line */}
                                        <div 
                                            className="h-px w-0 group-hover:w-full transition-all duration-700"
                                            style={{ backgroundColor: themeColors.primaryButton }}
                                        />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
