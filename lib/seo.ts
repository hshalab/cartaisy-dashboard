import { Metadata } from 'next';

export const siteConfig = {
  name: 'Cartaisy',
  description: 'Transform your Shopify store into a powerful native mobile app. Boost sales with push notifications, Apple Pay, and seamless shopping experiences.',
  url: 'https://cartaisy.com',
  ogImage: 'https://cartaisy.com/og-image.png',
  twitterHandle: '@cartaisy',
  keywords: [
    'Shopify mobile app',
    'mobile app builder',
    'Shopify app',
    'ecommerce mobile app',
    'push notifications',
    'Apple Pay',
    'Google Pay',
    'mobile commerce',
    'mcommerce',
    'Shopify integration',
    'native mobile app',
    'iOS app builder',
    'Android app builder',
  ],
};

export type PageSEO = {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

export function generateMetadata(page: PageSEO): Metadata {
  const title = page.title === 'Home'
    ? `${siteConfig.name} - Mobile App Builder for Shopify`
    : `${page.title} | ${siteConfig.name}`;

  return {
    title,
    description: page.description,
    keywords: [...siteConfig.keywords, ...(page.keywords || [])],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: page.noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      siteName: siteConfig.name,
      title,
      description: page.description,
      images: [
        {
          url: page.ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.description,
      images: [page.ogImage || siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
  };
}
