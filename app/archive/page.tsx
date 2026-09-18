export const dynamic = "force-dynamic";
import Link from 'next/link';
import type { Metadata } from 'next';
import { getWritings } from '@/lib/content';
import { ArrowLeft } from 'lucide-react';
import ArchiveClient from './ArchiveClient';

export const metadata: Metadata = {
  title: 'The Archive',
  description: 'A complete index of published writings in the literary archive of Yash Kant Tiwary.',
  openGraph: {
    title: 'The Archive | Tiwary’s Writing',
    description: 'A complete index of published writings.',
    url: '/archive',
  },
};

export default async function ArchivePage() {
  const writings = await getWritings();
  
  // Get all unique years
  const yearsSet = new Set<string>();
  writings.forEach(w => yearsSet.add(w.year));
  const years = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <main className="min-h-screen pb-32">
      <header className="py-16 lg:py-24 px-6 sm:px-12 lg:px-16 xl:px-24 2xl:px-32 max-w-7xl 2xl:max-w-[1700px] mx-auto w-full flex items-center justify-between">
        <div>
           <Link href="/" className="inline-flex items-center gap-2 text-sm sm:text-base lg:text-lg font-sans text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors mb-4">
             <ArrowLeft size={16} className="lg:w-5 lg:h-5" />
             <span>Return</span>
           </Link>
           <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-serif text-[var(--color-ink)]">The Archive</h1>
        </div>
      </header>

      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 2xl:px-32 max-w-7xl 2xl:max-w-[1700px] mx-auto w-full">
        {writings.length === 0 ? (
          <p className="text-[var(--color-ink-muted)] font-serif italic">The archive is empty.</p>
        ) : (
          <ArchiveClient writings={writings} years={years} />
        )}
      </div>
    </main>
  );
}
