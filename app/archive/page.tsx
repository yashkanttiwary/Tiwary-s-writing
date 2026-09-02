import Link from 'next/link';
import { getWritings } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default async function ArchivePage() {
  const writings = await getWritings();

  // Group by year
  const groupedWritings = writings.reduce((acc, writing) => {
    const year = writing.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(writing);
    return acc;
  }, {} as Record<string, typeof writings>);

  const years = Object.keys(groupedWritings).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <main className="min-h-screen pb-32">
      <header className="py-20 px-6 sm:px-12 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div>
           <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors mb-4">
             <ArrowLeft size={14} />
             <span>Return</span>
           </Link>
           <h1 className="text-3xl font-serif text-[var(--color-ink)]">The Archive</h1>
        </div>
      </header>

      <div className="px-6 sm:px-12 max-w-5xl mx-auto w-full">
        {years.length === 0 ? (
          <p className="text-[var(--color-ink-muted)] font-serif italic">The archive is empty.</p>
        ) : (
          <div className="flex flex-col gap-24">
            {years.map(year => (
              <section key={year} className="relative">
                <div className="sm:absolute left-0 top-0 sm:w-32 mb-6 sm:mb-0">
                  <h2 className="text-2xl font-serif text-[var(--color-ink-faint)] sticky top-24">{year}</h2>
                </div>
                
                <div className="sm:pl-32 flex flex-col gap-12">
                  {groupedWritings[year].map(writing => (
                    <article key={writing.metadata.id} className="group border-b border-[var(--color-border)] border-opacity-50 pb-8 last:border-0 last:pb-0">
                      <Link href={`/writing/${writing.year}/${writing.metadata.slug}`} className="block">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                           <h3 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors flex-1">
                             {writing.metadata.title || "Untitled"}
                           </h3>
                           <time className="text-sm text-[var(--color-ink-faint)] font-sans sm:text-right shrink-0">
                             {formatDate(writing.metadata.publishedAt as string)}
                           </time>
                        </div>
                        {writing.metadata.excerpt ? (
                          <p className="mt-4 text-[var(--color-ink-muted)] font-serif line-clamp-2 max-w-2xl">
                            {writing.metadata.excerpt}
                          </p>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-ink-faint)] font-sans">
                             <span className="capitalize">{writing.metadata.type}</span>
                             {writing.metadata.language === 'hi' && <span>· Hindi</span>}
                          </div>
                        )}
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
