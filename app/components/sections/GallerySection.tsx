'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc } from '@/app/lib/utils';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import useEmblaCarousel from 'embla-carousel-react';

interface GallerySectionProps {
    gallerySection: Page['gallerySection'];
    className?: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallerySection, className }) => {
    if (!gallerySection?.enabled || !gallerySection.images || gallerySection.images.length === 0) {
        return null;
    }

    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();
    const { site } = useWebBuilder();

    const images = useMemo(() => {
        const processedImages = (gallerySection.images || []).map((image: any, index: number) => {
            const imageUrl = typeof image === 'string' ? image : image.url;
            const altText = typeof image === 'object' ? image.altText : '';
            const caption = typeof image === 'object' ? image.caption : null;
            return {
                key: `${imageUrl}-${index}`,
                imageUrl,
                altText,
                caption,
            };
        });
        return processedImages;
    }, [gallerySection.images]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            emblaApi?.scrollTo(index);
        },
        [emblaApi]
    );

    const prevIndex = (selectedIndex - 1 + images.length) % images.length;
    const nextIndex = (selectedIndex + 1) % images.length;

    return (
        <section
            className={cn('py-16 lg:py-24', className)}
            style={{ backgroundColor: themeColors.pageBackground }}
        >
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <div
                        className="text-xs tracking-wide"
                        style={{ color: themeColors.darkSecondaryText }}
                    >
                        2025 Edition →
                    </div>

                    {gallerySection.title && (
                        <h2
                            className="mt-3 text-4xl lg:text-5xl font-semibold"
                            style={{ color: themeColors.darkPrimaryText }}
                        >
                            <TiptapRenderer content={gallerySection.title} />
                        </h2>
                    )}

                    {gallerySection.description && (
                        <div
                            className="mt-3 text-sm max-w-3xl mx-auto"
                            style={{ color: themeColors.darkSecondaryText }}
                        >
                            <TiptapRenderer content={gallerySection.description} />
                        </div>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-12 gap-8 items-center">
                    {/* Left preview */}
                    <button
                        type="button"
                        className="hidden lg:block col-span-2 rounded-2xl overflow-hidden border transition-transform"
                        style={{
                            borderColor: `${themeColors.inactive}30`,
                            backgroundColor: '#fff',
                        }}
                        onClick={() => scrollTo(prevIndex)}
                        aria-label="Previous image"
                    >
                        <div className="aspect-square">
                            <img
                                src={getImageSrc(images[prevIndex]?.imageUrl)}
                                alt={images[prevIndex]?.altText || ''}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </button>

                    {/* Main carousel */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="overflow-hidden" ref={emblaRef}>
                            <div className="flex">
                                {images.map((img, idx) => (
                                    <div
                                        key={img.key}
                                        className="shrink-0 grow-0 basis-full px-2"
                                        aria-hidden={idx !== selectedIndex}
                                    >
                                        <div
                                            className="rounded-3xl overflow-hidden border"
                                            style={{
                                                borderColor: `${themeColors.inactive}22`,
                                                boxShadow: '0 20px 45px rgba(0,0,0,0.10)',
                                            }}
                                        >
                                            <div className="relative aspect-[16/7] md:aspect-[16/9] lg:aspect-[16/7]">
                                                <img
                                                    src={getImageSrc(img.imageUrl)}
                                                    alt={img.altText || `Gallery image ${idx + 1}`}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-2">
                            {images.slice(0, 8).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`Go to slide ${i + 1}`}
                                    onClick={() => scrollTo(i)}
                                    className="h-2 rounded-full transition-all"
                                    style={{
                                        width: selectedIndex === i ? 18 : 6,
                                        backgroundColor: selectedIndex === i ? themeColors.darkPrimaryText : `${themeColors.inactive}66`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right preview */}
                    <button
                        type="button"
                        className="hidden lg:block col-span-2 rounded-2xl overflow-hidden border transition-transform"
                        style={{
                            borderColor: `${themeColors.inactive}30`,
                            backgroundColor: '#fff',
                        }}
                        onClick={() => scrollTo(nextIndex)}
                        aria-label="Next image"
                    >
                        <div className="aspect-square">
                            <img
                                src={getImageSrc(images[nextIndex]?.imageUrl)}
                                alt={images[nextIndex]?.altText || ''}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
};
