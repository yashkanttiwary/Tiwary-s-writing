"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Search as SearchIcon } from 'lucide-react';

interface WritingLight {
  id: string;
  title?: string;
  slug: string;
  publishedAt: string;
  type: string;
  year: string;
  content: string;
}

export default function SearchClient({ writings }: { writings: WritingLight[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const matches = [];

    for (const w of writings) {
      let matchedContent = "";
      let isMatch = false;

      // Check title
      if (w.title?.toLowerCase().includes(lowerQuery)) {
        isMatch = true;
      }
      
      // Check type / tag equivalents if needed
      if (w.type.toLowerCase().includes(lowerQuery)) {
        isMatch = true;
      }

      // Check content
      const contentIndex = w.content.toLowerCase().indexOf(lowerQuery);
      if (contentIndex !== -1) {
        isMatch = true;
        
        let start = contentIndex;
        while (start > 0 && !['.', '!', '?', '\n'].includes(w.content[start - 1])) {
          start--;
        }
        
        let end = contentIndex + lowerQuery.length;
        while (end < w.content.length && !['.', '!', '?', '\n'].includes(w.content[end])) {
          end++;
        }
        
        if (end < w.content.length && ['.', '!', '?'].includes(w.content[end])) {
           end++;
        }
        
        matchedContent = w.content.slice(start, end).trim();
        matchedContent = matchedContent.replace(/[#*`_]/g, '');
        
        // If it's too long, truncate it nicely
        if (matchedContent.length > 200) {
           matchedContent = matchedContent.slice(0, 200) + '...';
        }
      }

      if (isMatch) {
        matches.push({
          writing: w,
          matchedContent
        });
      }
    }
    
    return matches;
  }, [query, writings]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">
      <div className="relative">
        <SearchIcon size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        <input 
          type="text" 
          placeholder="Search the archive..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent border-b border-[var(--color-border)] py-4 pl-10 pr-4 text-xl sm:text-2xl font-serif text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink-muted)] transition-colors placeholder:text-[var(--color-ink-faint)]"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-12">
        {query.trim() && results.length === 0 && (
          <p className="text-[var(--color-ink-faint)] font-serif italic text-lg text-center mt-12">
            No writings found for "{query}".
          </p>
        )}

        {results.map((res, i) => {
          // Highlight the query in the matched content if possible
          let displayMatch = <>{res.matchedContent}</>;
          if (res.matchedContent) {
             const parts = res.matchedContent.split(new RegExp(`(${query})`, 'gi'));
             displayMatch = (
                <>
                   {parts.map((part, idx) => 
                     part.toLowerCase() === query.toLowerCase() 
                     ? <strong key={idx} className="text-[var(--color-ink)] font-normal">{part}</strong> 
                     : part
                   )}
                </>
             );
          }

          return (
            <Link key={res.writing.id + i} href={`/writing/${res.writing.year}/${res.writing.slug}`} className="group block">
              <h3 className="text-2xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-tight">
                {res.writing.title || "Untitled"}
              </h3>
              <div className="text-xs font-sans text-[var(--color-ink-faint)] mt-2 flex items-center gap-2">
                <time>{formatDate(res.writing.publishedAt)}</time>
                <span>·</span>
                <span className="capitalize">{res.writing.type}</span>
              </div>
              {res.matchedContent && (
                <div className="mt-4 font-serif text-[var(--color-ink-muted)] text-lg leading-relaxed relative pl-4 border-l border-[var(--color-border)]">
                  {displayMatch}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
