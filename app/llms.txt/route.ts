import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  
  const content = `# Tiwary's Writing Archive
A living literary archive of Yash Kant Tiwary's life in words.

## Canonical Identity
Website: ${siteUrl}
Author: Yash Kant Tiwary
Author Contact: yashkanttiwary@gmail.com

## Machine-Readable Endpoints
- Archive Manifest (JSON): ${siteUrl}/archive.json
- RSS Feed: ${siteUrl}/feed.xml
- API Base: ${siteUrl}/api/v1/writings
- OpenAPI Spec: ${siteUrl}/openapi.json

## Access and Policy
The public literary works on this site are open for search indexing and discovery.
Each writing has a canonical HTML page at \`/writing/[year]/[slug]\`.
Machine representations (JSON, Markdown) are available via the API.
Public crawlability does not automatically grant unrestricted commercial reuse or AI model training rights.

## Sitemap
Sitemap is available at ${siteUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    }
  });
}
