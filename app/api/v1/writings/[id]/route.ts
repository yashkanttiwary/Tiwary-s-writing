import { NextResponse } from 'next/server';
import { getWritings } from '@/lib/content';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // The ID might include .md if it's the markdown representation
  const isMarkdown = id.endsWith('.md');
  const actualId = isMarkdown ? id.replace(/\.md$/, '') : id;

  const writings = await getWritings();
  const writing = writings.find(w => w.metadata.id === actualId);
  
  if (!writing) {
    return new NextResponse('Not found', { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  const canonicalUrl = `${siteUrl}/writing/${writing.year}/${writing.metadata.slug}`;

  if (isMarkdown) {
    // Reconstruct a simplified frontmatter for the machine representation
    const frontmatter = [
      '---',
      `id: "${writing.metadata.id}"`,
      `canonicalUrl: "${canonicalUrl}"`,
      `title: "${writing.metadata.title || ''}"`,
      `publishedAt: "${writing.metadata.publishedAt}"`,
      `type: "${writing.metadata.type}"`,
      `language: "${writing.metadata.language}"`,
      '---',
      '',
      writing.content
    ].join('\n');

    return new NextResponse(frontmatter, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  }

  const jsonResponse = {
    id: writing.metadata.id,
    canonicalUrl,
    title: writing.metadata.title,
    publishedAt: writing.metadata.publishedAt,
    modifiedAt: writing.metadata.updatedAt,
    type: writing.metadata.type,
    language: writing.metadata.language,
    themes: writing.metadata.themes,
    tags: writing.metadata.tags,
    collections: writing.metadata.collections,
    excerpt: writing.metadata.excerpt,
    body: writing.content,
    bodyFormat: 'markdown'
  };

  return NextResponse.json(jsonResponse, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  });
}
