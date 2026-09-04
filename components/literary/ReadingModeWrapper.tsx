'use client';
import { useState, useEffect } from 'react';
import { EyeOff, Eye } from 'lucide-react';

export default function ReadingModeWrapper({ children }: { children: React.ReactNode }) {
  const [distractionFree, setDistractionFree] = useState(false);
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

  return (
    <div className={distractionFree ? 'distraction-free' : ''}>
       <div className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-24'}`}>
         <button
            onClick={() => setDistractionFree(!distractionFree)}
           className={`p-3 rounded-full border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors shadow-sm ${distractionFree ? 'opacity-20 hover:opacity-100' : ''}`}
           title={distractionFree ? 'Exit Distraction Free Mode' : 'Distraction Free Mode'}
         >
            {distractionFree ? <Eye size={18} /> : <EyeOff size={18} />}
         </button>
       </div>
       
       <div className={distractionFree ? 'opacity-0 pointer-events-none transition-opacity duration-1000' : 'transition-opacity duration-500'}>
          {/* Elements inside children can listen to this parent class via CSS */}
       </div>
       
       {children}
    </div>
  );
}
