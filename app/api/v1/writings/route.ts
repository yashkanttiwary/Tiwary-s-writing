import { NextResponse } from 'next/server';
import { getWritings } from '@/lib/content';

export async function GET(request: Request) {
  const writings = await getWritings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '100');
  const page = parseInt(searchParams.get('page') || '1');
  
  let filteredWritings = writings;
  
  if (year) {
    filteredWritings = filteredWritings.filter(w => w.year === year);
  }
  if (type) {
    filteredWritings = filteredWritings.filter(w => w.metadata.type === type);
  }
  
  const startIndex = (page - 1) * limit;
  const paginatedWritings = filteredWritings.slice(startIndex, startIndex + limit);
  
  const responseData = {
    data: paginatedWritings.map(w => ({
      id: w.metadata.id,
      canonicalUrl: `${siteUrl}/writing/${w.year}/${w.metadata.slug}`,
      title: w.metadata.title,
      publishedAt: w.metadata.publishedAt,
      modifiedAt: w.metadata.updatedAt,
      type: w.metadata.type,
      language: w.metadata.language,
      themes: w.metadata.themes,
      tags: w.metadata.tags,
      collections: w.metadata.collections,
      excerpt: w.metadata.excerpt,
    })),
    meta: {
      total: filteredWritings.length,
      page,
      limit,
    }
  };

  return NextResponse.json(responseData, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  });
}
