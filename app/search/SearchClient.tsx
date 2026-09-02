"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Search as SearchIcon } from 'lucide-react';

interface WritingLight {
  id: string;
  title?: string;
  slug: string;
  publishedAt: string;
  type: string;
  year: string;
  content: string;
}

const HINDI_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy', 'श्र': 'shr',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f',
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
  '्': '',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  '।': '.', '॥': '..'
};

function transliterateAndNormalize(text: string): string {
  if (!text) return "";
  let trans = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    trans += HINDI_MAP[char] !== undefined ? HINDI_MAP[char] : char;
  }
  let norm = trans.toLowerCase();
  norm = norm.replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/aa/g, 'a').replace(/w/g, 'v');
  norm = norm.replace(/(.)\1+/g, '$1');
  return norm;
}

export default function SearchClient({ writings }: { writings: WritingLight[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const normalizedQuery = transliterateAndNormalize(query.trim());
    const exactQueryLower = query.trim().toLowerCase();
    const matches = [];

    for (const w of writings) {
      let matchedContent = "";
      let isMatch = false;

      const titleNorm = transliterateAndNormalize(w.title || '');
      if (titleNorm.includes(normalizedQuery)) {
        isMatch = true;
      }
      
      const typeNorm = transliterateAndNormalize(w.type);
      if (typeNorm.includes(normalizedQuery)) {
        isMatch = true;
      }

      // Check content line-by-line / sentence-by-sentence
      // Split by punctuation or newline, keeping the delimiters to reconstruct safely
      const fragments = w.content.split(/([.?!|\n]+)/);
      let sentences = [];
      let current = "";
      for (let i = 0; i < fragments.length; i++) {
        current += fragments[i];
        if (i % 2 === 1 || i === fragments.length - 1) {
          if (current.trim()) sentences.push(current.trim());
          current = "";
        }
      }

      for (const sentence of sentences) {
        // Strip out markdown for cleaner matching and display
        const plainSentence = sentence.replace(/[#*`_]/g, '');
        const sentenceNorm = transliterateAndNormalize(plainSentence);
        
        if (sentenceNorm.includes(normalizedQuery)) {
          isMatch = true;
          matchedContent = plainSentence;
          
          if (matchedContent.length > 200) {
             matchedContent = matchedContent.slice(0, 200) + '...';
          }
          break; // just need the first matched sentence
        }
      }

      if (isMatch) {
        matches.push({
          writing: w,
          matchedContent
        });
      }
    }
    
    return matches;
  }, [query, writings]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">
      <div className="relative">
        <SearchIcon size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        <input 
          type="text" 
          placeholder="Search the archive..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent border-b border-[var(--color-border)] py-4 pl-10 pr-4 text-xl sm:text-2xl font-serif text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink-muted)] transition-colors placeholder:text-[var(--color-ink-faint)]"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-12">
        {query.trim() && results.length === 0 && (
          <p className="text-[var(--color-ink-faint)] font-serif italic text-lg text-center mt-12">
            No writings found for "{query}".
          </p>
        )}

        {results.map((res, i) => {
          let displayMatch: React.ReactNode = <>{res.matchedContent}</>;
          
          if (res.matchedContent) {
            // Try to highlight exact match (e.g. if searching in English for English text)
            if (res.matchedContent.toLowerCase().includes(query.trim().toLowerCase())) {
               const parts = res.matchedContent.split(new RegExp(`(${query.trim()})`, 'gi'));
               displayMatch = (
                  <>
                     {parts.map((part, idx) => 
                       part.toLowerCase() === query.trim().toLowerCase() 
                       ? <strong key={idx} className="text-[var(--color-ink)] font-medium bg-[var(--color-ink)]/5 px-1 rounded">{part}</strong> 
                       : part
                     )}
                  </>
               );
            } else {
               // Phonetic Hindi match: exact substring replacement is hard, so we prominently display the matched sentence
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
