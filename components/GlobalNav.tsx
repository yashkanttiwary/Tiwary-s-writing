'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function GlobalNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (pathname === '/') return null;

  return (
    <div className={`fixed bottom-6 left-6 z-50 pointer-events-none flex gap-3 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-24'}`}>
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
