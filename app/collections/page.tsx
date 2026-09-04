export const dynamic = "force-dynamic";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getWritings } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import ReadingModeWrapper from '@/components/literary/ReadingModeWrapper';
import { ArrowLeft, Book, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Writings grouped by shared themes, eras, or forthcoming volumes.',
  openGraph: {
    title: 'Collections | Tiwary’s Writing',
    description: 'Writings grouped by shared themes, eras, or forthcoming volumes.',
    url: '/collections',
  },
};

interface Props {
  searchParams: Promise<{ theme?: string; name?: string }>;
}

export default async function CollectionsPage({ searchParams }: Props) {
  const { theme, name } = await searchParams;
  const writings = await getWritings();
  
  // If a filter is applied, we only group writings that match the filter
  const isThemeFilter = !!theme;
  const isNameFilter = !!name;
  const filterActive = isThemeFilter || isNameFilter;

  const collectionsMap = new Map<string, typeof writings>();
  let totalMatches = 0;
  
  if (isThemeFilter) {
    const matchedWritings = writings.filter(w => w.metadata.themes?.includes(theme));
    totalMatches = matchedWritings.length;
    collectionsMap.set(`Theme: ${theme}`, matchedWritings);
  } else if (isNameFilter) {
    const matchedWritings = writings.filter(w => w.metadata.collections?.includes(name));
    totalMatches = matchedWritings.length;
    collectionsMap.set(name, matchedWritings);
  } else {
    writings.forEach(writing => {
      const collections = writing.metadata.collections || [];
      collections.forEach(collection => {
        if (!collectionsMap.has(collection)) {
          collectionsMap.set(collection, []);
        }
        collectionsMap.get(collection)!.push(writing);
      });
    });
  }

  const collections = Array.from(collectionsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

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
          <header className="mb-16">
             <div className="flex items-center gap-4 mb-6">
                <Book className="text-[var(--color-ink-faint)]" size={24} strokeWidth={1} />
                <h1 className="text-3xl font-serif text-[var(--color-ink)]">
                  {isThemeFilter ? 'Themes' : 'Collections'}
                </h1>
             </div>
             
             {!filterActive && (
               <p className="text-[var(--color-ink-muted)] font-serif italic text-lg max-w-2xl">
                 Writings grouped by shared themes, eras, or forthcoming volumes.
               </p>
             )}

             {filterActive && (
               <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-ink)]/5 rounded-full border border-[var(--color-border)]">
                   <span className="text-sm font-sans text-[var(--color-ink-muted)]">
                     {isThemeFilter ? 'Theme:' : 'Collection:'} <strong className="text-[var(--color-ink)] font-medium ml-1">{isThemeFilter ? theme : name}</strong>
                   </span>
                   <Link href="/collections" className="ml-2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors" title="Clear filter" aria-label="Clear filter">
                     <X size={14} />
                   </Link>
                 </div>
                 <div className="text-sm font-sans text-[var(--color-ink-faint)]">
                   {totalMatches} {totalMatches === 1 ? 'piece' : 'pieces'} found
                 </div>
               </div>
             )}
          </header>

          {collections.length === 0 ? (
            <div className="py-20 text-center border-t border-[var(--color-border)]">
              <p className="text-[var(--color-ink-muted)] font-serif text-lg italic">
                {filterActive ? 'No writings found for this filter.' : 'No collections have been created yet.'}
              </p>
              {filterActive && (
                <Link href="/collections" className="mt-6 inline-block text-sm font-sans uppercase tracking-widest text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
                  View all collections
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-24">
              {collections.map(([collectionName, collectionWritings]) => (
                <section key={collectionName} className="group">
                  {!filterActive && (
                    <div className="border-b border-[var(--color-border)] pb-4 mb-8 flex items-baseline justify-between">
                      <h2 className="text-2xl font-serif text-[var(--color-ink)]">{collectionName}</h2>
                      <p className="text-sm font-sans text-[var(--color-ink-faint)]">
                        {collectionWritings.length} {collectionWritings.length === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                  )}
                  
                  <div className={`grid gap-6 ${!filterActive ? 'pl-4 sm:pl-8 border-l border-[var(--color-border)]' : ''}`}>
                    {collectionWritings.map(writing => (
                      <Link key={writing.metadata.id} href={`/writing/${writing.year}/${writing.metadata.slug}`} className={`block group/link ${filterActive ? 'p-6 border border-[var(--color-border)] hover:border-[var(--color-ink-faint)] rounded transition-colors' : ''}`}>
                        <h3 className="text-xl font-serif text-[var(--color-ink)] group-hover/link:text-[var(--color-ink-muted)] transition-colors">
                          {writing.metadata.title || "Untitled"}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-ink-faint)] font-sans">
                           <time dateTime={writing.metadata.publishedAt as string}>{formatDate(writing.metadata.publishedAt as string)}</time>
                           <span>·</span>
                           <span className="capitalize">{writing.metadata.type}</span>
                        </div>
                        {filterActive && writing.metadata.excerpt && (
                          <p className="mt-4 font-serif text-[var(--color-ink-muted)]">
                            {writing.metadata.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </article>
      </main>
    </ReadingModeWrapper>
  );
}
