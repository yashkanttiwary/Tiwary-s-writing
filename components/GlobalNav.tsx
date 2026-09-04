'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';

export default function GlobalNav() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none flex gap-3">
      <Link 
        href="/" 
        className="pointer-events-auto bg-[var(--color-canvas)] border border-[var(--color-border)] shadow-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-faint)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md bg-opacity-90"
        title="Go to Home"
        aria-label="Return to Homepage"
      >
        <Home size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </div>
  );
}
