'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookmarkMinus } from 'lucide-react';

interface SavedBookmark {
  id: string;
  title: string;
  url: string;
  type: string;
  publishedAt: string;
}

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadBookmarks = () => {
    try {
      const stored = localStorage.getItem('tiwary_bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to read bookmarks', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadBookmarks();

    // Listen for custom event if they are updated elsewhere in the same tab
    window.addEventListener('bookmarks_updated', loadBookmarks);
    return () => window.removeEventListener('bookmarks_updated', loadBookmarks);
  }, []);

  const removeBookmark = (id: string) => {
    try {
      const updated = bookmarks.filter(b => b.id !== id);
      localStorage.setItem('tiwary_bookmarks', JSON.stringify(updated));
      setBookmarks(updated);
      window.dispatchEvent(new Event('bookmarks_updated'));
    } catch (err) {
      console.error('Failed to update bookmarks', err);
    }
  };

  if (!mounted) return null;

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 border-t border-[var(--color-border)] text-[var(--color-ink-muted)] font-serif italic text-lg text-center opacity-80">
        Your reading list is currently empty.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 border-t border-[var(--color-border)] pt-8">
      {bookmarks.map((bookmark) => (
        <article key={bookmark.id} className="group flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6 pb-8 border-b border-[var(--color-border)]/50 last:border-b-0">
          <div className="text-sm text-[var(--color-ink-faint)] font-sans w-32 flex-shrink-0">
             <time dateTime={bookmark.publishedAt}>
               {new Date(bookmark.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
             </time>
          </div>
          
          <div className="flex-1 flex flex-col items-start gap-2">
            <Link href={bookmark.url} className="block group">
              <h3 className="text-2xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-tight">
                {bookmark.title}
              </h3>
            </Link>
            <div className="flex items-center gap-4 mt-2">
              <span className="capitalize text-xs tracking-wider text-[var(--color-ink-faint)] font-sans border border-[var(--color-border)] px-2 py-0.5 rounded-full">
                {bookmark.type}
              </span>
              <button 
                onClick={() => removeBookmark(bookmark.id)}
                className="text-xs font-sans text-[var(--color-ink-muted)] hover:text-red-700 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Remove from bookmarks"
              >
                <BookmarkMinus size={14} /> Remove
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
