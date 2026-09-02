import { NextResponse } from 'next/server';
import { getWritings } from '@/lib/content';

export async function GET() {
  const writings = await getWritings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  
  const manifest = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "name": "Tiwary's Writing Archive Manifest",
    "description": "A machine-readable manifest of Yash Kant Tiwary's published writings.",
    "url": `${siteUrl}/archive.json`,
    "creator": {
      "@type": "Person",
      "name": "Yash Kant Tiwary",
      "url": siteUrl
    },
    "dateModified": new Date().toISOString(),
    "dataset": writings.map(w => ({
      "@type": "CreativeWork",
      "identifier": w.metadata.id,
      "url": `${siteUrl}/writing/${w.year}/${w.metadata.slug}`,
      "name": w.metadata.title || "Untitled",
      "datePublished": w.metadata.publishedAt,
      "genre": w.metadata.type,
      "inLanguage": w.metadata.language,
      "encoding": [
        {
          "@type": "MediaObject",
          "encodingFormat": "application/json",
          "contentUrl": `${siteUrl}/api/v1/writings/${w.metadata.id}`
        },
        {
          "@type": "MediaObject",
          "encodingFormat": "text/markdown",
          "contentUrl": `${siteUrl}/api/v1/writings/${w.metadata.id}.md`
        }
      ]
    }))
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  });
}
