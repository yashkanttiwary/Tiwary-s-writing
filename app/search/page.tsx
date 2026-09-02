import { getWritings } from '@/lib/content';
import SearchClient from './SearchClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function SearchPage() {
  const writings = await getWritings();
  
  // We only need a lightweight version of the writings for the client
  const writingsLight = writings.map(w => ({
    id: w.metadata.id,
    title: w.metadata.title,
    slug: w.metadata.slug,
    publishedAt: w.metadata.publishedAt as string,
    type: w.metadata.type,
    year: w.year,
    content: w.content
  }));

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-32">
      <nav className="py-8 px-6 sm:px-12 max-w-5xl mx-auto w-full flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </nav>
      
      <div className="px-6 sm:px-12 pt-10 sm:pt-20 max-w-5xl mx-auto">
        <SearchClient writings={writingsLight} />
      </div>
    </main>
  );
}
