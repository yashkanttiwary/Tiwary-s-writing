import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  
  if (!key.endsWith('.txt')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const expectedKey = process.env.INDEXNOW_KEY;
  const requestedKey = key.replace('.txt', '');

  if (expectedKey && requestedKey === expectedKey) {
    return new NextResponse(expectedKey, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return new NextResponse('Not found', { status: 404 });
}
