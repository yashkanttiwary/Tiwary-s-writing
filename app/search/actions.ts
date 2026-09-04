"use server";

import { getWritings } from '@/lib/content';

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

export type SearchResult = {
  writing: {
    id: string;
    title?: string;
    slug: string;
    publishedAt: string;
    type: string;
    year: string;
  };
  matchedContent: string;
};

export async function searchArchive(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  const writings = await getWritings();
  const normalizedQuery = transliterateAndNormalize(query.trim());
  
  const matches: SearchResult[] = [];

  for (const w of writings) {
    let matchedContent = "";
    let isMatch = false;

    const titleNorm = transliterateAndNormalize(w.metadata.title || '');
    if (titleNorm.includes(normalizedQuery)) {
      isMatch = true;
    }
    
    const typeNorm = transliterateAndNormalize(w.metadata.type);
    if (typeNorm.includes(normalizedQuery)) {
      isMatch = true;
    }

    // Improved sentence tokenization (M-001)
    // Splitting carefully around sentence boundaries to avoid breaking on abbreviations
    const fragments = w.content.split(/(?<=[.?!])\s+|\n+/);

    for (const sentence of fragments) {
      if (!sentence.trim()) continue;
      
      const plainSentence = sentence.replace(/[#*`_>]/g, '');
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
        writing: {
          id: w.metadata.id,
          title: w.metadata.title,
          slug: w.metadata.slug,
          publishedAt: w.metadata.publishedAt as string,
          type: w.metadata.type,
          year: w.year
        },
        matchedContent
      });
    }
  }
  
  return matches;
}
