import { NextResponse } from 'next/server';
import { getWritings } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const writings = await getWritings();
  const latest = writings[0];
  
  if (!latest) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.redirect(new URL(`/writing/${latest.year}/${latest.metadata.slug}`, request.url));
}
