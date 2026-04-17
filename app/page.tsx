import { Metadata } from 'next'
import { generateMetadata as buildMetadata, getSiteSeoData } from '@/app/lib/metadata'
import { Page, Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import HomeClient from './HomeClient'

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch default site
    const defaultSiteResponse = await api.get('/public/sites/default')
    
    if (defaultSiteResponse.success && defaultSiteResponse.data) {
      const site: Site = defaultSiteResponse.data
      
      // Fetch pages to find home page
      const pagesResponse = await api.get(`/public/sites/${site.slug}/pages`)
      
      if (pagesResponse.success && pagesResponse.data) {
        const pages: Page[] = pagesResponse.data
        const homePage = pages.find(p => p.pageType === 'home')
        
        if (homePage) {
          // Use page SEO data, fallback to site SEO data
          const seoData = {
            title: homePage.seo?.title || site.seo?.title,
            description: homePage.seo?.description || site.seo?.description || site.business?.description,
            keywords: homePage.seo?.keywords || site.seo?.keywords,
            ogImageUrl: homePage.seo?.ogImageUrl || site.seo?.ogImageUrl,
            noIndex: homePage.seo?.noIndex || false
          }

          return buildMetadata(seoData, site)
        }
      }
      
      // Fallback: use site SEO data
      return buildMetadata(getSiteSeoData(site), site)
    }
  } catch (error) {
    console.error('Error generating home metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Web Builder Site',
    description: 'Generated site using Web Builder',
  }
}

export default function Home() {
  return <HomeClient />
}
