import Link from 'next/link';
import { getWritings, Writing } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Sparkles, History, Search } from 'lucide-react';

export default async function Home() {
  const allWritings = await getWritings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tiwary’s Writing',
    url: siteUrl,
    description: 'A life, left in words. A living literary archive of Yash Kant Tiwary.',
    author: {
      '@type': 'Person',
      name: 'Yash Kant Tiwary',
      url: siteUrl
    }
  };

  if (allWritings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-ink-muted)]">The archive is empty.</p>
      </div>
    );
  }

  // --- Featured ---
  const featured = allWritings.find(w => w.metadata.featured) || allWritings[0];
  
  // --- Temporal discovery ("On This Day") ---
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  const onThisDay = allWritings.filter(w => {
    const pubString = w.metadata.publishedAt;
    if (typeof pubString !== 'string' || pubString.length < 10) return false;
    
    // Extract directly from YYYY-MM-DD string to avoid timezone parsing shifts
    const month = parseInt(pubString.substring(5, 7), 10);
    const date = parseInt(pubString.substring(8, 10), 10);
    const year = parseInt(pubString.substring(0, 4), 10);
    
    return month === currentMonth && date === currentDay && year !== today.getFullYear();
  });

  // --- Archive Presence Metrics ---
  const totalWritings = allWritings.length;
  const years = Array.from(new Set(allWritings.map(w => new Date(w.metadata.publishedAt).getFullYear()))).sort();
  const earliestYear = years.length > 0 ? years[0] : null;

  // --- Themes ---
  const themeCounts = allWritings.reduce((acc, w) => {
    (w.metadata.tags || []).forEach(t => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const sortedThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(t => t[0]);

  // --- From the Archive ---
  const excludeIds = new Set([
    featured.metadata.id, 
    ...onThisDay.map(w => w.metadata.id)
  ]);
  const olderWritings = allWritings.filter(w => !excludeIds.has(w.metadata.id));
  // Deterministic "random" older piece (changes daily based on day of month)
  const archiveIndex = olderWritings.length > 0 ? (today.getDate() % olderWritings.length) : 0;
  const fromArchive = olderWritings.length > 0 ? olderWritings[archiveIndex] : null;

  // Helper for rendering excerpts properly
  const renderExcerpt = (writing: Writing) => {
    if (writing.metadata.excerpt) {
      return <p className="font-serif text-[var(--color-ink-muted)] text-lg leading-relaxed whitespace-pre-wrap">{writing.metadata.excerpt}</p>;
    }
    
    if (writing.metadata.type === 'poetry') {
      const contentLines = writing.content.split('\n');
      let previewLines: string[] = [];
      let count = 0;
      for (let line of contentLines) {
        if (count > 4) break;
        if (line.trim() === '') {
          if (previewLines.length > 0 && previewLines[previewLines.length - 1] !== '') {
            previewLines.push('');
          }
        } else {
          previewLines.push(line);
          count++;
        }
      }
      
      return (
        <div className="font-serif text-[var(--color-ink-muted)] text-lg leading-relaxed text-left inline-block w-full max-w-fit">
          {previewLines.map((line, i) => (
            <span key={i} className="block min-h-[1.5rem] tracking-wide">
              {line}
            </span>
          ))}
        </div>
      );
    } else {
       // Prose/fragment fallback
       const plainText = writing.content.replace(/[#*`_]/g, '').trim();
       const firstSentenceMatch = plainText.match(/^.*?[.?!](?:\s|$)/);
       let preview = firstSentenceMatch ? firstSentenceMatch[0] : plainText.slice(0, 150) + '...';
       return <p className="font-serif text-[var(--color-ink-muted)] text-lg leading-relaxed line-clamp-3">{preview}</p>;
    }
  };

  // --- Recently Rediscovered ---
  // Architected for when actual engagement data becomes available in the future.
  // We look for a hypothetical 'recentViews' metric or 'rediscovered' flag.
  const rediscoveredWritings = allWritings.filter(w => 
    (w.metadata as any).recentViews > 100 || (w.metadata as any).rediscovered === true
  ).slice(0, 2);

  return (
    <main className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="py-20 px-6 sm:px-12 max-w-5xl mx-auto w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-[var(--color-ink)]">Tiwary’s Writing</h1>
          <p className="text-[var(--color-ink-muted)] mt-2 font-serif italic text-lg">A life, left in words.</p>
        </div>
        <nav className="flex gap-6 items-center">
          <Link href="/archive" className="text-sm font-sans tracking-wide uppercase text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
            Archive
          </Link>
          <Link href="/collections" className="text-sm font-sans tracking-wide uppercase text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
            Collections
          </Link>
          <Link href="/search" className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors ml-2" aria-label="Search">
            <Search size={16} strokeWidth={1.5} />
          </Link>
        </nav>
      </header>

      <div className="flex-1 px-6 sm:px-12 max-w-5xl mx-auto w-full flex flex-col gap-32 pb-32">
        
        {/* Featured (Asymmetric) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans">Featured</div>
            <div className="text-sm text-[var(--color-ink-muted)] font-sans flex flex-col gap-1">
              <time dateTime={featured.metadata.publishedAt as string}>
                {formatDate(featured.metadata.publishedAt as string)}
              </time>
              <span className="capitalize">{featured.metadata.type}</span>
              {featured.metadata.language === 'hi' && <span>Hindi</span>}
            </div>
          </div>
          
          <div className="md:col-span-8">
            <Link href={`/writing/${featured.year}/${featured.metadata.slug}`} className="group block">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors duration-300 leading-tight">
                {featured.metadata.title || "Untitled"}
              </h2>
              
              <div className="mt-8">
                {renderExcerpt(featured)}
              </div>
              
              <div className="mt-10 flex items-center gap-3 text-sm text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors duration-300">
                 <span className="border-b border-[var(--color-ink-muted)] group-hover:border-[var(--color-ink)] pb-1 transition-colors">Read piece</span>
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <hr className="border-t border-[var(--color-border)] opacity-60" />

        {/* On This Day */}
        {onThisDay.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
            <div className="md:col-span-4 flex flex-col gap-2">
              <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans flex items-center gap-2">
                <History size={14}/> On This Day
              </div>
            </div>
            
            <div className="md:col-span-8 flex flex-col gap-16">
              {onThisDay.map(writing => {
                 const yearsAgo = today.getFullYear() - new Date(writing.metadata.publishedAt).getFullYear();
                 return (
                   <article key={writing.metadata.id} className="group">
                     <div className="text-sm text-[var(--color-ink-faint)] font-sans mb-3">{yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago today</div>
                     <Link href={`/writing/${writing.year}/${writing.metadata.slug}`} className="block">
                       <h4 className="text-2xl sm:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-tight">
                         {writing.metadata.title || "Untitled"}
                       </h4>
                       <div className="mt-6 opacity-80 group-hover:opacity-100 transition-opacity">
                          {renderExcerpt(writing)}
                       </div>
                     </Link>
                   </article>
                 )
              })}
            </div>
          </section>
        )}

        {onThisDay.length > 0 && <hr className="border-t border-[var(--color-border)] opacity-60" />}

        {/* From the Archive */}
        {fromArchive && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans">From the Archive</div>
            </div>
            
            <div className="md:col-span-8">
              <Link href={`/writing/${fromArchive.year}/${fromArchive.metadata.slug}`} className="group block">
                 <div className="text-sm text-[var(--color-ink-faint)] font-sans mb-3 flex items-center gap-2">
                   <time dateTime={fromArchive.metadata.publishedAt as string}>
                     {formatDate(fromArchive.metadata.publishedAt as string)}
                   </time>
                   <span>·</span>
                   <span className="capitalize">{fromArchive.metadata.type}</span>
                 </div>
                 <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-tight">
                   {fromArchive.metadata.title || "Untitled"}
                 </h3>
                 <div className="mt-6">
                    {renderExcerpt(fromArchive)}
                 </div>
              </Link>
            </div>
          </section>
        )}

        {rediscoveredWritings.length > 0 && <hr className="border-t border-[var(--color-border)] opacity-60" />}

        {/* Recently Rediscovered */}
        {rediscoveredWritings.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans">Recently Rediscovered</div>
            </div>
            
            <div className="md:col-span-8 flex flex-col gap-16">
              {rediscoveredWritings.map(writing => (
                <article key={writing.metadata.id} className="group">
                  <div className="text-sm text-[var(--color-ink-faint)] font-sans mb-3 flex items-center gap-2">
                     <time dateTime={writing.metadata.publishedAt as string}>
                       {formatDate(writing.metadata.publishedAt as string)}
                     </time>
                     <span>·</span>
                     <span className="capitalize">{writing.metadata.type}</span>
                  </div>
                  <Link href={`/writing/${writing.year}/${writing.metadata.slug}`} className="block">
                    <h4 className="text-2xl sm:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-tight">
                      {writing.metadata.title || "Untitled"}
                    </h4>
                    <div className="mt-6 opacity-80 group-hover:opacity-100 transition-opacity">
                       {renderExcerpt(writing)}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* The Archive Timeline / Presence */}
        <section className="bg-[#f5f4ef] px-6 py-16 -mx-6 sm:px-12 sm:-mx-12 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center border border-[var(--color-border)]/50">
           <div className="md:col-span-4">
              <div className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] font-sans">The Archive</div>
           </div>
           <div className="md:col-span-8 flex flex-col gap-8">
              <p className="text-xl font-serif text-[var(--color-ink-muted)] leading-relaxed">
                 Currently containing {totalWritings} {totalWritings === 1 ? 'writing' : 'writings'} across {years.length} {years.length === 1 ? 'year' : 'years'}. 
                 {earliestYear && ` The earliest entry dates to ${earliestYear}.`}
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                 {years.map(y => (
                    <div key={y} className="flex flex-col gap-1 items-start">
                       <span className="text-sm font-serif text-[var(--color-ink)]">{y}</span>
                       <span className="w-4 h-px bg-[var(--color-border)] block opacity-50"></span>
                    </div>
                 ))}
              </div>
              <div className="mt-2">
                <Link href="/archive" className="text-sm font-sans tracking-wide uppercase text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-2 w-fit group">
                  Enter the archive <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
           </div>
        </section>

        {/* Threads (Themes) */}
        {sortedThemes.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-sans">Threads</div>
            </div>
            
            <div className="md:col-span-8">
               <div className="flex flex-wrap gap-x-4 gap-y-3 leading-loose font-serif text-lg text-[var(--color-ink-muted)]">
                  {sortedThemes.map((theme, i) => (
                     <span key={theme} className="flex items-center gap-4 group">
                        <Link href={`/collections?theme=${encodeURIComponent(theme)}`} className="hover:text-[var(--color-ink)] transition-colors cursor-pointer">{theme}</Link>
                        {i < sortedThemes.length - 1 && <span className="text-[var(--color-border)]">·</span>}
                     </span>
                  ))}
               </div>
            </div>
          </section>
        )}

        <hr className="border-t border-[var(--color-border)] opacity-60" />

        {/* Discovery */}
        <section className="py-20 flex flex-col items-center justify-center text-center">
          <Link href="/random" className="group flex flex-col items-center gap-4">
             <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-muted)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-canvas)] group-hover:border-[var(--color-ink)] transition-all duration-500 hover:scale-105 active:scale-95">
                <Sparkles size={18} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform duration-500" />
             </div>
             <div>
               <span className="block text-lg font-serif text-[var(--color-ink)]">Take me somewhere</span>
               <span className="block text-sm text-[var(--color-ink-faint)] mt-2 italic font-serif">Wander into the archive</span>
             </div>
          </Link>
        </section>

      </div>
    </main>
  );
}
