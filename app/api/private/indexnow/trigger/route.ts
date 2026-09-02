import { NextResponse } from 'next/server';
import { getWritings } from '@/lib/content';
import { submitToIndexNow } from '@/lib/indexnow';

export async function POST(request: Request) {
  // Simple auth check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
    const writings = await getWritings();
    
    // In a real implementation, you would track which URLs changed.
    // For this endpoint, we'll submit the top 10 most recent writings.
    const recentWritings = writings.slice(0, 10);
    const urlsToSubmit = recentWritings.map(w => `${siteUrl}/writing/${w.year}/${w.metadata.slug}`);
    
    await submitToIndexNow(urlsToSubmit);
    
    return NextResponse.json({ success: true, submittedCount: urlsToSubmit.length });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
