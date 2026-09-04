'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import type { Writing } from '@/lib/content';

interface SavedBookmark {
  id: string;
  title: string;
  url: string;
  type: string;
  publishedAt: string;
}

export default function BookmarkButton({ writing, url }: { writing: Writing, url: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('tiwary_bookmarks');
      if (stored) {
        const bookmarks: SavedBookmark[] = JSON.parse(stored);
        const exists = bookmarks.some(b => b.id === writing.metadata.id);
        setIsBookmarked(exists);
      }
    } catch (err) {
      console.error('Failed to read bookmarks', err);
    }
  }, [writing.metadata.id]);

  const toggleBookmark = () => {
    try {
      const stored = localStorage.getItem('tiwary_bookmarks');
      let bookmarks: SavedBookmark[] = stored ? JSON.parse(stored) : [];
      
      if (isBookmarked) {
        bookmarks = bookmarks.filter(b => b.id !== writing.metadata.id);
        setIsBookmarked(false);
      } else {
        bookmarks.push({
          id: writing.metadata.id,
          title: writing.metadata.title || 'Untitled',
          url: url,
          type: writing.metadata.type,
          publishedAt: writing.metadata.publishedAt as string
        });
        setIsBookmarked(true);
      }
      
      localStorage.setItem('tiwary_bookmarks', JSON.stringify(bookmarks));
      
      // Dispatch a custom event so the global nav/bookmarks page can update
      window.dispatchEvent(new Event('bookmarks_updated'));
    } catch (err) {
      console.error('Failed to save bookmark', err);
    }
  };

  if (!mounted) return (
    <button className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] opacity-50 p-2" aria-disabled="true">
      <Bookmark size={16} />
      <span className="hidden sm:inline font-medium">Bookmark</span>
    </button>
  );

  return (
    <button 
      onClick={toggleBookmark}
      className={`inline-flex items-center gap-2 text-sm font-sans transition-colors p-2 ${
        isBookmarked 
          ? 'text-[var(--color-ink)]' 
          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
      }`}
      title={isBookmarked ? "Remove Bookmark" : "Bookmark this"}
      aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark this writing"}
    >
      <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} strokeWidth={isBookmarked ? 1 : 2} />
      <span className="hidden sm:inline font-medium">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
    </button>
  );
}
