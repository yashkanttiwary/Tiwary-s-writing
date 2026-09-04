import SearchClient from './SearchClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Search',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-32">
      <nav className="py-8 px-6 sm:px-12 max-w-5xl mx-auto w-full flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </nav>
      
      <div className="px-6 sm:px-12 pt-10 sm:pt-20 max-w-5xl mx-auto">
        <Suspense fallback={<div className="text-center font-serif text-[var(--color-ink-muted)]">Loading search...</div>}>
          <SearchClient />
        </Suspense>
      </div>
    </main>
  );
}
