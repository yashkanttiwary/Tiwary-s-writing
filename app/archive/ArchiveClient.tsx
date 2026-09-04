"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Writing } from '@/lib/content';
import { ArrowUp } from 'lucide-react';

interface Props {
  writings: Writing[];
  years: string[];
}

export default function ArchiveClient({ writings, years }: Props) {
  const [activeType, setActiveType] = useState<string | null>(null);

  // Derive unique types for the filter
  const types = useMemo(() => {
    const t = new Set<string>();
    writings.forEach(w => {
      if (w.metadata.type) t.add(w.metadata.type);
    });
    return Array.from(t).sort();
  }, [writings]);

  // Filter writings
  const filteredWritings = useMemo(() => {
    if (!activeType) return writings;
    return writings.filter(w => w.metadata.type === activeType);
  }, [writings, activeType]);

  // Group filtered writings by year
  const groupedWritings = useMemo(() => {
    return filteredWritings.reduce((acc, writing) => {
      const year = writing.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(writing);
      return acc;
    }, {} as Record<string, Writing[]>);
  }, [filteredWritings]);

  const filteredYears = Object.keys(groupedWritings).sort((a, b) => parseInt(b) - parseInt(a));

  const scrollToYear = (year: string) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div className="mb-16 border-b border-[var(--color-border)] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
        
        {/* Type Filter */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-sans uppercase tracking-widest text-[var(--color-ink-faint)]">Filter by Form</span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveType(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-sans transition-colors border ${!activeType ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'bg-transparent text-[var(--color-ink-muted)] border-[var(--color-border)] hover:border-[var(--color-ink-faint)]'}`}
            >
              All Forms
            </button>
            {types.map(t => (
              <button 
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-sans transition-colors border capitalize ${activeType === t ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'bg-transparent text-[var(--color-ink-muted)] border-[var(--color-border)] hover:border-[var(--color-ink-faint)]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Year Jump Navigation */}
        {filteredYears.length > 1 && (
          <div className="flex flex-col gap-3 md:items-end">
            <span className="text-xs font-sans uppercase tracking-widest text-[var(--color-ink-faint)]">Jump to Year</span>
            <div className="flex flex-wrap gap-2">
              {filteredYears.map(year => (
                <button
                  key={`nav-${year}`}
                  onClick={() => scrollToYear(year)}
                  className="px-2 py-1 text-sm font-serif text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mb-12">
         <div className="text-sm font-sans text-[var(--color-ink-faint)]">
           Showing {filteredWritings.length} {filteredWritings.length === 1 ? 'piece' : 'pieces'}
         </div>
      </div>

      {filteredYears.length === 0 ? (
        <div className="py-20 text-center border-t border-[var(--color-border)]">
          <p className="text-[var(--color-ink-muted)] font-serif text-lg italic">
            No writings found for the selected form.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-24">
          {filteredYears.map(year => (
            <section key={year} id={`year-${year}`} className="relative scroll-mt-24">
              <div className="sm:absolute left-0 top-0 sm:w-32 mb-6 sm:mb-0">
                <h2 className="text-2xl font-serif text-[var(--color-ink-faint)] sticky top-24">{year}</h2>
              </div>
              
              <div className="sm:pl-32 flex flex-col gap-8 sm:gap-12">
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
                        <p className="mt-4 text-[var(--color-ink-muted)] font-serif line-clamp-2 max-w-2xl leading-relaxed">
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

      {filteredYears.length > 0 && (
        <div className="mt-20 pt-8 border-t border-[var(--color-border)] flex justify-center">
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm font-sans text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowUp size={14} />
            Back to top
          </button>
        </div>
      )}
    </div>
  );
}
