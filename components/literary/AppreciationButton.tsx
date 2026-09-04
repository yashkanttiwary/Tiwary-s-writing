'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function AppreciationButton() {
  const [appreciated, setAppreciated] = useState(false);

  return (
    <button 
      onClick={() => setAppreciated(true)}
      disabled={appreciated}
      className={`group flex flex-col items-center gap-3 transition-colors ${appreciated ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]'}`}
    >
      <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${appreciated ? 'border-[var(--color-ink)]' : 'border-[var(--color-border)] group-hover:border-[var(--color-ink)]'}`}>
        <Heart size={18} className={appreciated ? 'fill-current' : 'group-hover:fill-current'} />
      </div>
      <span className="font-serif italic text-lg tracking-wide">
        {appreciated ? 'Appreciated' : 'Appreciate'}
      </span>
    </button>
  );
}
