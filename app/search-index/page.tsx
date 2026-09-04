import type { Metadata } from 'next';
import Link from 'next/link';
import { getWritings } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Directory & Index',
  description: 'A curated directory of themes, collections, and writings in the archive of Yash Kant Tiwary.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SearchIndexPage() {
  const writings = await getWritings();
  
  // Aggregate themes and collections
  const themeMap = new Map<string, number>();
  const collectionMap = new Map<string, number>();
  
  writings.forEach(w => {
    w.metadata.themes?.forEach(t => {
      themeMap.set(t, (themeMap.get(t) || 0) + 1);
    });
    w.metadata.collections?.forEach(c => {
      collectionMap.set(c, (collectionMap.get(c) || 0) + 1);
    });
  });

  const sortedThemes = Array.from(themeMap.entries()).sort((a, b) => b[1] - a[1]);
  const sortedCollections = Array.from(collectionMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-12 border-b border-transparent hover:border-[var(--color-ink)] pb-0.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
          &larr; Return to Archive
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-serif mb-8 text-[var(--color-ink)]">Archive Directory</h1>
        <p className="mb-16 font-serif text-lg text-[var(--color-ink-muted)] leading-relaxed">
          Explore the complete collection of poetry, essays, and fragments by Yash Kant Tiwary, categorized by recurring themes and curated collections.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <section>
            <h2 className="text-sm font-sans uppercase tracking-widest text-[var(--color-ink-faint)] mb-8">Themes & Threads</h2>
            <ul className="flex flex-col gap-4 font-serif text-lg text-[var(--color-ink)]">
              {sortedThemes.map(([theme, count]) => (
                <li key={theme}>
                  <Link href={`/collections?theme=${encodeURIComponent(theme)}`} className="hover:text-[var(--color-ink-muted)] transition-colors flex items-center justify-between group">
                    <span>{theme}</span>
                    <span className="text-sm text-[var(--color-ink-faint)]">{count} {count === 1 ? 'piece' : 'pieces'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-sans uppercase tracking-widest text-[var(--color-ink-faint)] mb-8">Collections</h2>
            <ul className="flex flex-col gap-4 font-serif text-lg text-[var(--color-ink)]">
              {sortedCollections.length > 0 ? sortedCollections.map(([collection, count]) => (
                <li key={collection}>
                  <Link href={`/collections?name=${encodeURIComponent(collection)}`} className="hover:text-[var(--color-ink-muted)] transition-colors flex items-center justify-between group">
                    <span>{collection}</span>
                    <span className="text-sm text-[var(--color-ink-faint)]">{count} {count === 1 ? 'piece' : 'pieces'}</span>
                  </Link>
                </li>
              )) : (
                <li className="text-[var(--color-ink-faint)] italic">No collections currently defined.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
