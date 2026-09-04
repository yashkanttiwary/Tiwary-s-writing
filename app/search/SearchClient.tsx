"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { searchArchive, type SearchResult } from './actions';
import { useDebounce } from 'use-debounce';

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        setHasSearched(false);
        router.replace('/search', { scroll: false });
        return;
      }
      
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
      setIsLoading(true);
      try {
        const matches = await searchArchive(debouncedQuery);
        setResults(matches);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }
    
    performSearch();
  }, [debouncedQuery, router]);

  // Clear results immediately on query change so stale results don't show
  useEffect(() => {
    if (query !== debouncedQuery) {
      setIsLoading(true);
      setHasSearched(false);
    }
  }, [query, debouncedQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12" role="search">
      <h1 className="sr-only">Search Archive</h1>
      <div className="relative flex flex-col gap-2">
        <label htmlFor="search-input" className="sr-only">Search writings by title, theme, or content</label>
        {isLoading ? (
          <Loader2 size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] animate-spin" />
        ) : (
          <SearchIcon size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        )}
        <input 
          id="search-input"
          type="search"
          maxLength={100}
          placeholder="Search the archive (e.g. title, theme)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent border-b border-[var(--color-border)] py-4 pl-10 pr-4 text-xl sm:text-2xl font-serif text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink-muted)] transition-colors placeholder:text-[var(--color-ink-faint)]"
          autoFocus
        />
        <div className="text-sm text-[var(--color-ink-faint)] mt-2" aria-live="polite">
          {isLoading ? 'Searching...' : hasSearched ? `Found ${results.length} result${results.length === 1 ? '' : 's'}` : 'Enter keywords to search across titles, themes, and content.'}
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {hasSearched && !isLoading && results.length === 0 && (
          <p className="text-[var(--color-ink-faint)] font-serif italic text-lg text-center mt-12">
            No writings found for "{debouncedQuery}".
          </p>
        )}

        {!isLoading && results.map((res, i) => {
          let displayMatch: React.ReactNode = <>{res.matchedContent}</>;
          
          if (res.matchedContent) {
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
