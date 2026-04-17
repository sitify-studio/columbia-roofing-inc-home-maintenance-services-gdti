'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Site, Page, Service, BlogPost, Project } from '@/app/lib/types';
import { siteApi, pageApi, serviceApi, blogApi, projectApi, testimonialApi, serviceAreaApi } from '@/app/lib/api';

// Site slug from environment variable
const SITE_SLUG = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG || 'brightpath-home-services-mm9bo6ed-2n7p';





interface WebBuilderContextType {
  site: Site | null;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  testimonials: { title?: string; description?: string; testimonials: any[] } | null;
  serviceAreaPages: any[];
  currentPage: Page | null;
  setCurrentPage: (page: Page | null) => void;
  loading: boolean;
  error: string | null;
  loadPage: (siteSlug: string, pageSlug: string) => Promise<void>;
}

const WebBuilderContext = createContext<WebBuilderContextType | undefined>(undefined);

export const useWebBuilder = () => {
  const context = useContext(WebBuilderContext);
  if (context === undefined) {
    throw new Error('useWebBuilder must be used within a WebBuilderProvider');
  }
  return context;
};

interface WebBuilderProviderProps {
  children: ReactNode;
}

export const WebBuilderProvider: React.FC<WebBuilderProviderProps> = ({ children }) => {
  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<{ title?: string; description?: string; testimonials: any[] } | null>(null);
  const [serviceAreaPages, setServiceAreaPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSite = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use real API with ISR (60 second revalidation by default)
      const siteData = await siteApi.getSiteBySlug(slug, 60);
      setSite(siteData);
      
      await Promise.all([
        loadPages(siteData.slug),
        loadServicesBySiteSlug(siteData.slug),
        loadBlogPosts(siteData.slug),
        loadProjects(siteData.slug),
        loadTestimonials(siteData.slug),
        loadServiceAreaPages(siteData.slug),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load site');
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (siteSlug: string, pageSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const pageData = await pageApi.getPageBySlug(siteSlug, pageSlug);
      setCurrentPage(pageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async (siteSlug: string) => {
    try {
      const pagesData = await pageApi.getPagesBySite(siteSlug, 60);
      setPages(pagesData);
    } catch (err) {
      console.warn('Failed to load pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadServicesBySiteSlug = async (siteSlug: string) => {
    try {
      const servicesData = await serviceApi.getServicesBySite(siteSlug, 60);
      setServices(servicesData);
    } catch (err) {
      console.warn('Failed to load services:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadBlogPosts = async (siteSlug: string, limit?: number) => {
    try {
      const postsData = await blogApi.getPostsBySite(siteSlug, limit, 60);
      setBlogPosts(postsData);
    } catch (err) {
      console.warn('Failed to load blog posts:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadProjects = async (siteSlug: string, limit?: number) => {
    try {
      const projectsData = await projectApi.getProjectsBySite(siteSlug, limit, 60);
      setProjects(projectsData);
    } catch (err) {
      console.warn('Failed to load projects:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadTestimonials = async (siteSlug: string) => {
    try {
      const testimonialsData = await testimonialApi.getTestimonialsBySite(siteSlug, 60);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.warn('Failed to load testimonials:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadServiceAreaPages = async (siteSlug: string) => {
    try {
      const serviceAreaPagesData = await serviceAreaApi.getServiceAreaPagesBySite(siteSlug, 60);
      setServiceAreaPages(serviceAreaPagesData);
    } catch (err) {
      console.warn('Failed to load service area pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Auto-load site from env variable on mount
  useEffect(() => {
    if (!SITE_SLUG) {
      setError('NEXT_PUBLIC_WEBBUILDER_SITE_SLUG environment variable is not defined. Please check your .env file.');
      return;
    }
    loadSite(SITE_SLUG);
  }, []);

  // Note: Polling removed - using ISR (Incremental Static Regeneration) instead
  // Data will be refreshed via Next.js ISR and on-demand revalidation
  // Call the revalidation API endpoint when content changes in the backend

  const contextValue: WebBuilderContextType = {
    site,
    pages,
    services,
    blogPosts,
    projects,
    testimonials,
    serviceAreaPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    loadPage,
  };

  return (
    <WebBuilderContext.Provider value={contextValue}>
      {children}
    </WebBuilderContext.Provider>
  );
};
