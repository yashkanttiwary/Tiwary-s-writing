import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center gap-8">
        <h1 className="text-4xl sm:text-5xl font-serif text-[var(--color-ink)]">Not Found</h1>
        <p className="font-serif text-[var(--color-ink-muted)] text-lg">
          The page or writing you are looking for does not exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded hover:border-[var(--color-ink-faint)] hover:text-[var(--color-ink)] text-[var(--color-ink-muted)] transition-colors w-full sm:w-auto">
            <ArrowLeft size={16} />
            <span>Return Home</span>
          </Link>
          <Link href="/search" className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded hover:border-[var(--color-ink-faint)] hover:text-[var(--color-ink)] text-[var(--color-ink-muted)] transition-colors w-full sm:w-auto">
            <Search size={16} />
            <span>Search Archive</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
