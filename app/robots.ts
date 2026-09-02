import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/private/', '/preview/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
