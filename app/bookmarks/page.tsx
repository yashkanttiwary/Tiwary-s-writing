import { Metadata } from 'next';
import BookmarkList from '@/components/literary/BookmarkList';

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Your saved writings.',
};

export default function BookmarksPage() {
  return (
    <main className="min-h-screen py-16 px-6 sm:px-12 md:px-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-ink)] mb-4">Reading List</h1>
          <p className="text-lg text-[var(--color-ink-muted)] font-serif max-w-2xl">
            Pieces you have saved to return to later. This list is kept locally on your current device.
          </p>
        </header>

        <BookmarkList />
      </div>
    </main>
  );
}
