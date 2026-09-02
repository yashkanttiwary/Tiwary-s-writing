import { redirect } from 'next/navigation';
import { getWritings } from '@/lib/content';

export default async function RandomPage() {
  const writings = await getWritings();
  
  if (writings.length === 0) {
    redirect('/');
  }

  // Purely random for now, could be weighted later
  const randomIndex = Math.floor(Math.random() * writings.length);
  const randomWriting = writings[randomIndex];

  redirect(`/writing/${randomWriting.year}/${randomWriting.metadata.slug}`);
}
