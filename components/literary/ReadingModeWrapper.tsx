"use client";

import { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';

export default function ReadingModeWrapper({ children }: { children: React.ReactNode }) {
  const [distractionFree, setDistractionFree] = useState(false);

  return (
    <div className={distractionFree ? 'distraction-free' : ''}>
       <button 
         onClick={() => setDistractionFree(!distractionFree)}
         className={`fixed bottom-6 right-6 p-3 rounded-full border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors z-50 shadow-sm ${distractionFree ? 'opacity-20 hover:opacity-100' : ''}`}
         title={distractionFree ? 'Exit Distraction Free Mode' : 'Distraction Free Mode'}
       >
          {distractionFree ? <Eye size={18} /> : <EyeOff size={18} />}
       </button>
       
       <div className={distractionFree ? 'opacity-0 pointer-events-none transition-opacity duration-1000' : 'transition-opacity duration-500'}>
          {/* Elements inside children can listen to this parent class via CSS or we can just hide specific elements globally via CSS */}
       </div>
       
       {children}
    </div>
  );
}
