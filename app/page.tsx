import Link from 'next/link';
import { getWritings } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Sparkles, History } from 'lucide-react';

export default async function Home() {
  const allWritings = await getWritings();
  
  if (allWritings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-ink-muted)]">The archive is empty.</p>
      </div>
    );
  }

  const featured = allWritings.find(w => w.metadata.featured) || allWritings[0];
  const recent = allWritings.filter(w => w.metadata.id !== featured.metadata.id).slice(0, 5);

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  const onThisDay = allWritings.filter(w => {
    const pubDate = new Date(w.metadata.publishedAt);
    return pubDate.getMonth() + 1 === currentMonth && pubDate.getDate() === currentDay && pubDate.getFullYear() !== today.getFullYear();
  });

  return (
    <main className="min-h-screen flex flex-col">
      <header className="py-20 px-6 sm:px-12 max-w-5xl mx-auto w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-[var(--color-ink)]">Tiwary’s Writing</h1>
          <p className="text-[var(--color-ink-muted)] mt-2 font-serif italic text-lg">A life, left in words.</p>
        </div>
        <nav className="flex gap-6">
          <Link href="/archive" className="text-sm font-sans tracking-wide uppercase text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
            Archive
          </Link>
          <Link href="/collections" className="text-sm font-sans tracking-wide uppercase text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
            Collections
          </Link>
        </nav>
      </header>

      <div className="flex-1 px-6 sm:px-12 max-w-5xl mx-auto w-full flex flex-col gap-24 pb-32">
        
        {/* Featured */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px bg-[var(--color-border)] flex-1"></div>
            <span className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans">Featured</span>
            <div className="h-px bg-[var(--color-border)] flex-1"></div>
          </div>
          
          <Link href={`/writing/${featured.year}/${featured.metadata.slug}`} className="group block text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors duration-300">
              {featured.metadata.title || "Untitled"}
            </h2>
            <div className="mt-4 text-sm text-[var(--color-ink-faint)] font-sans flex items-center justify-center gap-2">
              <time dateTime={featured.metadata.publishedAt as string}>
                {formatDate(featured.metadata.publishedAt as string)}
              </time>
              <span>·</span>
              <span className="capitalize">{featured.metadata.type}</span>
            </div>
            
            {featured.metadata.excerpt && (
              <p className="mt-6 text-lg text-[var(--color-ink-muted)] font-serif leading-relaxed line-clamp-3">
                {featured.metadata.excerpt}
              </p>
            )}
            
            <div className="mt-8 flex justify-center">
              <span className="text-sm border border-[var(--color-border)] rounded-full px-4 py-1 flex items-center gap-2 text-[var(--color-ink-muted)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-canvas)] transition-all duration-300">
                Read piece <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </section>

        {/* Recent */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans">Recent Entries</h3>
              <div className="h-px bg-[var(--color-border)] flex-1"></div>
            </div>
            
            <div className="grid gap-12">
              {recent.map((writing) => (
                <article key={writing.metadata.id} className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <time className="text-sm text-[var(--color-ink-faint)] font-sans shrink-0 sm:w-32">
                    {formatDate(writing.metadata.publishedAt as string)}
                  </time>
                  <div>
                    <Link href={`/writing/${writing.year}/${writing.metadata.slug}`} className="block">
                      <h4 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                        {writing.metadata.title || "Untitled"}
                      </h4>
                      {writing.metadata.excerpt ? (
                        <p className="mt-2 text-[var(--color-ink-muted)] font-serif line-clamp-2">
                          {writing.metadata.excerpt}
                        </p>
                      ) : (
                        <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-ink-faint)] font-sans">
                           <span className="capitalize">{writing.metadata.type}</span>
                           {writing.metadata.language === 'hi' && <span>· Hindi</span>}
                        </div>
                      )}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* On This Day */}
        {onThisDay.length > 0 && (
           <section>
             <div className="flex items-center gap-4 mb-10">
               <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans flex items-center gap-2"><History size={14}/> On This Day</h3>
               <div className="h-px bg-[var(--color-border)] flex-1"></div>
             </div>
             
             <div className="grid gap-8">
               {onThisDay.map(writing => {
                  const yearsAgo = today.getFullYear() - new Date(writing.metadata.publishedAt).getFullYear();
                  return (
                    <article key={writing.metadata.id} className="group">
                      <div className="text-sm text-[var(--color-ink-faint)] font-sans mb-1">{yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago</div>
                      <Link href={`/writing/${writing.year}/${writing.metadata.slug}`} className="block">
                        <h4 className="text-2xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                          {writing.metadata.title || "Untitled"}
                        </h4>
                      </Link>
                    </article>
                  )
               })}
             </div>
           </section>
        )}

        {/* Discovery */}
        <section className="py-20 flex flex-col items-center justify-center text-center">
          <Link href="/random" className="group flex flex-col items-center gap-4">
             <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-muted)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-canvas)] group-hover:border-[var(--color-ink)] transition-all duration-500">
                <Sparkles size={18} />
             </div>
             <div>
               <span className="block text-lg font-serif text-[var(--color-ink)]">Take me somewhere</span>
               <span className="block text-sm text-[var(--color-ink-faint)] mt-1">Wander into the archive</span>
             </div>
          </Link>
        </section>

      </div>
    </main>
  );
}
