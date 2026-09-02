import { getWritings } from '@/lib/content';
import { Feed } from 'feed';
import { NextResponse } from 'next/server';

export async function GET() {
  const writings = await getWritings();
  
  const feed = new Feed({
    title: "Tiwary's Writing Archive",
    description: "A living literary archive designed for reading and preserving Yash Kant Tiwary's words.",
    id: "https://tiwary-archive.com/",
    link: "https://tiwary-archive.com/",
    language: "en",
    image: "https://tiwary-archive.com/logo.png",
    favicon: "https://tiwary-archive.com/favicon.ico",
    copyright: `All rights reserved ${new Date().getFullYear()}, Yash Kant Tiwary`,
    generator: "Feed for Node.js",
    author: {
      name: "Yash Kant Tiwary",
      email: "yashkanttiwary@gmail.com",
    }
  });

  writings.forEach(writing => {
    feed.addItem({
      title: writing.metadata.title || 'Untitled',
      id: writing.metadata.id,
      link: `https://tiwary-archive.com/writing/${writing.year}/${writing.metadata.slug}`,
      description: writing.metadata.excerpt || '',
      content: writing.content, // Optionally include full content
      author: [
        {
          name: "Yash Kant Tiwary",
          email: "yashkanttiwary@gmail.com",
        }
      ],
      date: new Date(writing.metadata.publishedAt),
      category: writing.metadata.tags.map(tag => ({ name: tag }))
    });
  });

  return new NextResponse(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
