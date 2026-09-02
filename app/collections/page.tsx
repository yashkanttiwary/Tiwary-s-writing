import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getWritings } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import ReadingModeWrapper from '@/components/literary/ReadingModeWrapper';
import { ArrowLeft, Book } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Writings grouped by shared themes, eras, or forthcoming volumes.',
  openGraph: {
    title: 'Collections | Tiwary’s Writing',
    description: 'Writings grouped by shared themes, eras, or forthcoming volumes.',
    url: '/collections',
  },
};

export default async function CollectionsPage() {
  const writings = await getWritings();
  
  // Group writings by collection
  const collectionsMap = new Map<string, typeof writings>();
  
  writings.forEach(writing => {
    const collections = writing.metadata.collections || [];
    collections.forEach(collection => {
      if (!collectionsMap.has(collection)) {
        collectionsMap.set(collection, []);
      }
      collectionsMap.get(collection)!.push(writing);
    });
  });

  const collections = Array.from(collectionsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  if (collections.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--color-canvas)] pb-32">
        <nav className="py-8 px-6 sm:px-12 max-w-5xl mx-auto w-full flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center pt-32">
          <p className="text-[var(--color-ink-muted)]">No collections have been created yet.</p>
        </div>
      </main>
    );
  }

  return (
    <ReadingModeWrapper>
      <main className="min-h-screen bg-[var(--color-canvas)] pb-32">
        <nav className="py-8 px-6 sm:px-12 max-w-5xl mx-auto w-full flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
        </nav>

        <article className="px-6 sm:px-12 pt-10 sm:pt-16 max-w-4xl mx-auto">
          <header className="mb-20">
             <div className="flex items-center gap-4 mb-6">
                <Book className="text-[var(--color-ink-faint)]" size={24} strokeWidth={1} />
                <h1 className="text-3xl font-serif text-[var(--color-ink)]">Collections</h1>
             </div>
             <p className="text-[var(--color-ink-muted)] font-serif italic text-lg max-w-2xl">
               Writings grouped by shared themes, eras, or forthcoming volumes.
             </p>
          </header>

          <div className="space-y-24">
            {collections.map(([collectionName, collectionWritings]) => (
              <section key={collectionName} className="group">
                <div className="border-b border-[var(--color-border)] pb-4 mb-8">
                  <h2 className="text-2xl font-serif text-[var(--color-ink)]">{collectionName}</h2>
                  <p className="text-sm font-sans text-[var(--color-ink-faint)] mt-2">
                    {collectionWritings.length} {collectionWritings.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                
                <div className="grid gap-6 pl-4 sm:pl-8 border-l border-[var(--color-border)]">
                  {collectionWritings.map(writing => (
                    <Link key={writing.metadata.id} href={`/writing/${writing.year}/${writing.metadata.slug}`} className="block group/link">
                      <h3 className="text-xl font-serif text-[var(--color-ink)] group-hover/link:text-[var(--color-ink-muted)] transition-colors">
                        {writing.metadata.title || "Untitled"}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-ink-faint)] font-sans">
                         <time dateTime={writing.metadata.publishedAt as string}>{formatDate(writing.metadata.publishedAt as string)}</time>
                         <span>·</span>
                         <span className="capitalize">{writing.metadata.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </ReadingModeWrapper>
  );
}
