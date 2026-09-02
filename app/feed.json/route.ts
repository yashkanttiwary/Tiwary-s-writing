import { NextResponse } from 'next/server';
import { getWritings } from '@/lib/content';

export async function GET() {
  const writings = await getWritings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  
  const jsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Tiwary's Writing Archive",
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: "A living literary archive designed for reading and preserving Yash Kant Tiwary's words.",
    authors: [
      {
        name: "Yash Kant Tiwary",
        url: siteUrl
      }
    ],
    items: writings.map(writing => ({
      id: writing.metadata.id,
      url: `${siteUrl}/writing/${writing.year}/${writing.metadata.slug}`,
      title: writing.metadata.title || "Untitled",
      summary: writing.metadata.excerpt,
      date_published: writing.metadata.publishedAt,
      date_modified: writing.metadata.updatedAt || writing.metadata.publishedAt,
      tags: writing.metadata.tags
    }))
  };

  return NextResponse.json(jsonFeed, {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
