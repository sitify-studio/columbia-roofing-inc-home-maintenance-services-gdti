import { Site, Page, Service, BlogPost, Project } from './types';
import api from './fetch-api';

// Base URL for API
const API_BASE_URL = process.env.API_BASE_URL || 'https://sitifystudio.com/api';

// Helper function for ISR-enabled fetch
async function fetchWithISR<T>(endpoint: string, revalidate: number = 60): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.data ?? data.data ?? data;
}

// Site API
export const siteApi = {
  getSiteBySlug: async (slug: string, revalidate: number = 60): Promise<Site> => {
    return fetchWithISR<Site>(`/public/sites/${slug}`, revalidate);
  },
  
  getSites: async (revalidate: number = 60): Promise<Site[]> => {
    return fetchWithISR<Site[]>('/sites', revalidate);
  },
};

// Page API
export const pageApi = {
  getPagesBySite: async (siteSlug: string, revalidate: number = 60): Promise<Page[]> => {
    return fetchWithISR<Page[]>(`/public/sites/${siteSlug}/pages`, revalidate);
  },
  
  getPageBySlug: async (siteSlug: string, pageSlug: string, revalidate: number = 60): Promise<Page> => {
    return fetchWithISR<Page>(`/public/sites/${siteSlug}/pages/${pageSlug}`, revalidate);
  },
  
  getPage: async (pageId: string, revalidate: number = 60): Promise<Page> => {
    return fetchWithISR<Page>(`/pages/${pageId}`, revalidate);
  },
};

// Service API
export const serviceApi = {
  getServicesBySite: async (siteSlug: string, revalidate: number = 60): Promise<Service[]> => {
    return fetchWithISR<Service[]>(`/public/sites/${siteSlug}/services`, revalidate);
  },
  
  getServiceBySlug: async (siteSlug: string, serviceSlug: string, revalidate: number = 60): Promise<Service> => {
    return fetchWithISR<Service>(`/public/sites/${siteSlug}/services/${serviceSlug}`, revalidate);
  },
  
  getServices: async (serviceIds: string[], revalidate: number = 60): Promise<Service[]> => {
    const response = await api.post('/public/services/batch', { serviceIds });
    return response.data?.data ?? response.data;
  },
};

// Blog API
export const blogApi = {
  getPostsBySite: async (siteSlug: string, limit?: number, revalidate: number = 60): Promise<BlogPost[]> => {
    const url = limit ? `/public/sites/${siteSlug}/blog?limit=${limit}` : `/public/sites/${siteSlug}/blog`;
    return fetchWithISR<BlogPost[]>(url, revalidate);
  },
  
  getPostBySlug: async (siteSlug: string, postSlug: string, revalidate: number = 60): Promise<BlogPost> => {
    return fetchWithISR<BlogPost>(`/public/sites/${siteSlug}/blog/${postSlug}`, revalidate);
  },
};

// Projects API
export const projectApi = {
  getProjectsBySite: async (siteSlug: string, limit?: number, revalidate: number = 60): Promise<Project[]> => {
    const url = limit ? `/public/sites/${siteSlug}/projects?limit=${limit}` : `/public/sites/${siteSlug}/projects`;
    return fetchWithISR<Project[]>(url, revalidate);
  },

  getProjectBySlug: async (siteSlug: string, projectSlug: string, revalidate: number = 60): Promise<Project> => {
    return fetchWithISR<Project>(`/public/sites/${siteSlug}/projects/${projectSlug}`, revalidate);
  },
};

// Testimonials API
export const testimonialApi = {
  getTestimonialsBySite: async (siteSlug: string, revalidate: number = 60): Promise<{ title?: string; description?: string; testimonials: any[] }> => {
    const response = await fetchWithISR<{ title?: string; description?: string; testimonials: any[] }>(`/testimonials?siteSlug=${siteSlug}`, revalidate);
    return response ?? { testimonials: [] };
  },
};

// Service Area Pages API
export const serviceAreaApi = {
  getServiceAreaPagesBySite: async (siteSlug: string, revalidate: number = 60): Promise<any[]> => {
    // Try both endpoint patterns for compatibility
    try {
      return fetchWithISR<any[]>(`/public/sites/${siteSlug}/service-area-pages`, revalidate);
    } catch (err) {
      // Fallback to empty array if endpoint doesn't exist
      return [];
    }
  },
};

// Media API for public access
export const mediaApi = {
  getMediaUrl: (path: string): string => {
    // If already a full URL, return as-is
    if (path?.startsWith('http')) {
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(path);
      return isLocal ? path : path.replace(/^http:\/\//i, 'https://');
    }
    
    // Remove leading slash and /uploads/ prefix if present
    let cleanPath = path?.replace(/^\//, '') || '';
    cleanPath = cleanPath.replace(/^uploads\//, '');
    
    if (!cleanPath) return '';
    
    const uploadsUrl = process.env.API_BASE_URL || 'https://sitifystudio.com/api';
    return `${uploadsUrl}/uploads/${cleanPath}`;
  },
};

export default api;
