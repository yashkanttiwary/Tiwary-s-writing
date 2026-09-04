import { MetadataRoute } from 'next';
import { getWritings } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';

  const writings = await getWritings();
  
  const writingUrls: MetadataRoute.Sitemap = writings.map((writing) => ({
    url: `${siteUrl}/writing/${writing.year}/${writing.metadata.slug}`,
    lastModified: writing.metadata.updatedAt || writing.metadata.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/archive`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/collections`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/search-index`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...writingUrls,
  ];
}
