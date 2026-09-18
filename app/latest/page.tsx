import { redirect } from 'next/navigation';
import { getWritings } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function LatestPage() {
  const writings = await getWritings();
  const latest = writings[0];
  
  if (!latest) {
    redirect('/');
  }
  
  redirect(`/writing/${latest.year}/${latest.metadata.slug}`);
}
