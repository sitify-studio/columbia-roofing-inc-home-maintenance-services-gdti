'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc } from '@/app/lib/utils';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { ArrowUpRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroSectionProps {
  hero: any;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  // More permissive check - render if there's any content
  if (!hero || (!hero.title && !hero.media && !hero.backgroundMedia)) return null;

  const mediaItems = useMemo(() => {
    const items = Array.isArray((hero as any).mediaItems) ? (hero as any).mediaItems : [];
    if (items.length > 0) return items;
    return hero.media ? [hero.media] : [];
  }, [hero]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

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

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section 
      className={cn('relative w-full h-screen overflow-hidden', className)}
      style={{ backgroundColor: themeColors.pageBackground }}
    >
      {/* Background Media Carousel */}
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="flex h-full">
          {mediaItems.map((item: any, idx: number) => (
            <div key={idx} className="shrink-0 grow-0 basis-full h-full relative">
              {item?.type === 'video' ? (
                <video className="h-full w-full object-cover" src={getImageSrc(item.url)} autoPlay muted loop playsInline />
              ) : (
                <img src={getImageSrc(item.url)} alt="" className="h-full w-full object-cover" />
              )}
              {/* Dark Overlay for Typography legibility */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-6">
        
        {/* Floating Heritage Badge (Reference: EST. 1998 • UDAIPUR) */}
        {hero.subtitle && (
          <div className="mb-6 animate-fade-in">
            <div className="inline-block px-6 py-2 border border-white/30 rounded-full backdrop-blur-md">
              <span className="text-white text-xs lg:text-sm font-medium tracking-[0.3em] uppercase">
                <TiptapRenderer content={hero.subtitle} as="inline" />
              </span>
            </div>
          </div>
        )}

        {/* Main Centered Title */}
        {hero.title && (
          <div 
            className="max-w-4xl md:max-w-5xl mb-4 md:mb-6 animate-slide-up"
            style={{ color: '#FFFFFF' }}
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[0.95] tracking-tight"
              style={{ color: themeColors.lightPrimaryText }}
            >
              <TiptapRenderer content={hero.title} />
            </h1>
          </div>
        )}

        {/* Centered Description */}
        {hero.description && (
          <div 
            className="max-w-xs md:max-w-xl animate-fade-in delay-300"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            <div className="text-sm md:text-base lg:text-lg leading-relaxed font-light">
              <TiptapRenderer content={hero.description} />
            </div>
          </div>
        )}

        {/* CTA Button - Using Theme Colors */}
        {hero.primaryCta && (
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2">
            <a
              href={hero.primaryCta.href}
              className="group flex items-center gap-2 md:gap-3 transition-all px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl"
              style={{ 
                backgroundColor: themeColors.primaryButton,
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.hoverActive;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primaryButton;
              }}
            >
              <span className="font-bold text-xs md:text-sm uppercase tracking-wider">{hero.primaryCta.label}</span>
              <div 
                className="rounded-full p-1 md:p-1.5 group-hover:rotate-45 transition-transform"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
            </a>
          </div>
        )}

        {/* Carousel Dots (Optional - matching reference minimal style) */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3">
          {mediaItems.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-500",
                selectedIndex === i ? "h-6 md:h-8 bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
