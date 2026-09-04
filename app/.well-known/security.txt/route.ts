import { NextResponse } from 'next/server';

export async function GET() {
  const content = `Contact: mailto:yashkanttiwary@gmail.com
Expires: 2030-01-01T00:00:00.000Z
Preferred-Languages: en
`;
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
