'use client';

import React from 'react';
import Link from 'next/link';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { ArrowUpRight } from 'lucide-react';

interface ProjectsSectionProps {
  projectsSection: Page['projectsSection'];
  className?: string;
}

type ProjectItem = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projectsSection, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const { projects } = useWebBuilder();

  if (!projectsSection?.enabled) return null;

  const publishedProjects = (projects || []).filter((p) => p.status === 'published');
  const latestProjects = publishedProjects.slice(0, 6);
  const manualProjects: ProjectItem[] = projectsSection.projects || [];
  // Use manual projects if they exist (they have images from page section), otherwise fall back to DB projects
  const displayItems = manualProjects.length > 0 ? manualProjects : latestProjects;

  return (
    <section className={cn('py-24 lg:py-32 overflow-hidden', className)} style={{ backgroundColor: themeColors.pageBackground }}>
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3">
              <span 
                className="text-[10px] tracking-[0.4em] uppercase font-bold"
                style={{ color: themeColors.primaryButton }}
              >
                Accommodations
              </span>
              <div className="w-12 h-[1px]" style={{ backgroundColor: `${themeColors.primaryButton}40` }} />
            </div>
            
            {projectsSection.title && (
              <h2
                className="text-4xl lg:text-5xl font-serif leading-tight"
                style={{ color: themeColors.lightPrimaryText }}
              >
                <TiptapRenderer content={projectsSection.title} />
              </h2>
            )}
          </div>

          {projectsSection.description && (
            <div
              className="max-w-sm text-base font-light leading-relaxed opacity-70"
              style={{ color: themeColors.lightSecondaryText }}
            >
              <TiptapRenderer content={projectsSection.description} />
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {displayItems.map((item: any, idx) => {
            // Determine if this is a DB project (has featuredImage) or manual project (has image from page section)
            const isDBProject = !!item.featuredImage;
            
            // Extract title - could be string or Tiptap object
            const rawTitle = item.title;
            const titleText = typeof rawTitle === 'string' 
              ? rawTitle 
              : (rawTitle?.content?.[0]?.content?.[0]?.text || 'Project');
            
            // Extract slug safely
            const slug = item.slug ? `/projects/${item.slug}` : '/project-detail';
            
            // Extract image URL - prioritize image for manual projects, featuredImage for DB projects
            const imageUrl = isDBProject 
              ? (item.featuredImage?.url ? getImageSrc(item.featuredImage.url) : '')
              : (item.image?.url ? getImageSrc(item.image.url) : '');
            
            // Alternating sizes for masonry feel
            const isEven = idx % 2 === 0;

            // Generate unique key - use index which is always unique
            const itemKey = `project-${idx}-${isDBProject ? 'db' : 'manual'}`;

            return (
              <div 
                key={itemKey} 
                className={cn(
                  "group relative flex flex-col",
                  !isEven && "md:mt-24" // Staggered effect
                )}
              >
                <Link href={slug} className="block overflow-hidden relative aspect-[4/5] rounded-sm bg-gray-100">
                  {/* Image with slow zoom on hover - only render if imageUrl exists */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={titleText}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Action Button */}
                  <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </div>
                </Link>

                {/* Content Overlay/Underlay */}
                <div className="mt-8">
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <h3
                      className="text-2xl lg:text-3xl font-serif"
                      style={{ color: themeColors.lightPrimaryText }}
                    >
                      {typeof rawTitle === 'string' ? rawTitle : <TiptapRenderer content={rawTitle} />}
                    </h3>
                    <span className="text-[10px] tracking-widest uppercase opacity-40 font-bold">
                      Explore
                    </span>
                  </div>
                  
                  {(!isDBProject ? item.description : item.shortDescription) && (
                    <div
                      className="mt-4 text-base font-light leading-relaxed opacity-60 max-w-md"
                      style={{ color: themeColors.lightSecondaryText }}
                    >
                      <TiptapRenderer content={!isDBProject ? item.description : item.shortDescription} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Section */}
        {publishedProjects.length > latestProjects.length && (
          <div className="mt-20 flex justify-center">
            <Link
              href="/project-detail"
              className="group flex items-center gap-6 px-10 py-5 border rounded-full transition-all duration-500"
              style={{ 
                borderColor: `${themeColors.secondaryText}20`, 
                color: themeColors.lightPrimaryText 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.darkPrimaryText;
                e.currentTarget.style.color = themeColors.lightPrimaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = themeColors.lightPrimaryText;
              }}
            >
              <span className="text-xs font-black uppercase tracking-[0.2em]" style={{}}>View All Projects</span>
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" style={{ color: 'inherit' }} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;