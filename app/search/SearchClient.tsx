"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { searchArchive, type SearchResult } from './actions';
import { useDebounce } from 'use-debounce';

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const matches = await searchArchive(debouncedQuery);
        setResults(matches);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">
      <div className="relative">
        {isLoading ? (
          <Loader2 size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] animate-spin" />
        ) : (
          <SearchIcon size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        )}
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
        {debouncedQuery.trim() && !isLoading && results.length === 0 && (
          <p className="text-[var(--color-ink-faint)] font-serif italic text-lg text-center mt-12">
            No writings found for "{debouncedQuery}".
          </p>
        )}

        {results.map((res, i) => {
          let displayMatch: React.ReactNode = <>{res.matchedContent}</>;
          
          if (res.matchedContent) {
            // Try to highlight exact match (e.g. if searching in English for English text)
            if (res.matchedContent.toLowerCase().includes(debouncedQuery.trim().toLowerCase())) {
               const parts = res.matchedContent.split(new RegExp(`(${debouncedQuery.trim()})`, 'gi'));
               displayMatch = (
                  <>
                     {parts.map((part, idx) => 
                       part.toLowerCase() === debouncedQuery.trim().toLowerCase() 
                       ? <strong key={idx} className="text-[var(--color-ink)] font-medium bg-[var(--color-ink)]/5 px-1 rounded">{part}</strong> 
                       : part
                     )}
                  </>
               );
            } else {
               // Phonetic Hindi match: exact substring replacement is hard, so we prominently display the matched sentence
               displayMatch = <span className="text-[var(--color-ink)]">{res.matchedContent}</span>;
            }
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
