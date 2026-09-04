import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Search Index & Directory',
  description: 'A comprehensive index of search intents, topics, and literary subjects covered in the archive of Yash Kant Tiwary.',
  robots: {
    index: true,
    follow: true,
  },
};

const SUBJECTS = [
  'love', 'longing', 'separation', 'memory', 'time', 'silence', 'consciousness',
  'the self', 'ego', 'thought', 'perception', 'fear', 'loneliness', 'relationships',
  'human connection', 'life', 'death', 'meaning', 'existence', 'truth', 'freedom',
  'awareness', 'attention', 'observation', 'identity', 'inner conflict', 'suffering',
  'peace', 'spirituality', 'creativity', 'art', 'beauty', 'change', 'impermanence',
  'desire', 'attachment', 'grief', 'hope', 'regret', 'belonging', 'solitude',
  'uncertainty', 'choice', 'human nature', 'everyday life'
];

export default function SearchIndexPage() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto opacity-40 hover:opacity-80 transition-opacity">
        <Link href="/" className="inline-block mb-12 border-b border-transparent hover:border-current pb-0.5">
          &larr; Return to Archive
        </Link>
        
        <h1 className="text-xl font-serif mb-8 text-[var(--color-ink)]">Tiwary’s Writings - Yash Kant Tiwary</h1>
        <p className="mb-12 font-serif text-sm">Poems · Essays · Observations · Notes</p>

        <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
{`YASH KANT TIWARY — WRITING SEARCH-INTENT MAP

==================================================
SECTION A — PRIMARY AUTHOR / WRITING INTENTS
==================================================

Yash Kant Tiwary writings
Yash Kant Tiwary writing
Yash Kant Tiwary writer
Yash Kant Tiwary author
Yash Kant Tiwary poetry
Yash Kant Tiwary poems
Yash Kant Tiwary essays
Yash Kant Tiwary reflections
Yash Kant Tiwary thoughts
Yash Kant Tiwary prose
Yash Kant Tiwary literary work
Yash Kant Tiwary personal writing
Yash Kant Tiwary philosophical writing
Yash Kant Tiwary creative writing
Yash Kant Tiwary original writings
Yash Kant Tiwary collected writings
Yash Kant Tiwary selected writings
Yash Kant Tiwary complete writings
Yash Kant Tiwary writing archive
Yash Kant Tiwary poetry archive
Yash Kant Tiwary essay archive
Yash Kant Tiwary official website
Yash Kant Tiwary author website
Yash Kant Tiwary writer website
Yash Kant Tiwary writing website

writings by Yash Kant Tiwary
writing by Yash Kant Tiwary
poetry by Yash Kant Tiwary
poems by Yash Kant Tiwary
essays by Yash Kant Tiwary
reflections by Yash Kant Tiwary
prose by Yash Kant Tiwary
thoughts by Yash Kant Tiwary
original writing by Yash Kant Tiwary
personal essays by Yash Kant Tiwary
philosophical essays by Yash Kant Tiwary
creative writing by Yash Kant Tiwary
literary work by Yash Kant Tiwary
read Yash Kant Tiwary writings
read Yash Kant Tiwary poetry
read Yash Kant Tiwary poems
read Yash Kant Tiwary essays
where to read Yash Kant Tiwary
find Yash Kant Tiwary writings
latest writing by Yash Kant Tiwary
new writing by Yash Kant Tiwary
latest poems by Yash Kant Tiwary
new poems by Yash Kant Tiwary
latest essays by Yash Kant Tiwary
new essays by Yash Kant Tiwary

Yash Kant Tiwary writing collection
Yash Kant Tiwary poetry collection
Yash Kant Tiwary poem collection
Yash Kant Tiwary essay collection
Yash Kant Tiwary prose collection
Yash Kant Tiwary literary collection
Yash Kant Tiwary complete archive
Yash Kant Tiwary online archive
Yash Kant Tiwary writing index
Yash Kant Tiwary poetry index
Yash Kant Tiwary poem index
Yash Kant Tiwary essay index
Yash Kant Tiwary all writings
Yash Kant Tiwary all poems
Yash Kant Tiwary all essays
Yash Kant Tiwary selected poems
Yash Kant Tiwary selected essays
Yash Kant Tiwary selected prose
Yash Kant Tiwary published writings
Yash Kant Tiwary published poems
Yash Kant Tiwary published essays
Yash Kant Tiwary author page
Yash Kant Tiwary writer profile
Yash Kant Tiwary biography writer
Yash Kant Tiwary about the author

Tiwary's writing
Tiwary's writings
Tiwary poetry
Tiwary poems
Tiwary essays
Tiwary reflections
Tiwary prose
Tiwary philosophical writing
Tiwary personal writing
Tiwary writing archive
Tiwary poetry archive
Tiwary essay archive
Tiwary writer
Tiwary author
Tiwary literary work
Yash Tiwary writing
Yash Tiwary writings
Yash Tiwary poetry
Yash Tiwary poems
Yash Tiwary essays
Yash Tiwary reflections
Yash Tiwary prose
Yash Tiwary writer
Yash Tiwary author
Yash Tiwary writing archive
`}

          {SUBJECTS.map((subject) => `
==================================================
EXPANSION — "${subject.toUpperCase()}"
==================================================

Yash Kant Tiwary writing on ${subject}
Yash Kant Tiwary writings on ${subject}
Yash Kant Tiwary essays on ${subject}
Yash Kant Tiwary reflections on ${subject}
Yash Kant Tiwary thoughts on ${subject}
Yash Kant Tiwary notes on ${subject}
Yash Kant Tiwary prose on ${subject}
Yash Kant Tiwary poetry about ${subject}
Yash Kant Tiwary poems about ${subject}
Yash Kant Tiwary personal writing about ${subject}
Yash Kant Tiwary philosophical writing on ${subject}
Yash Kant Tiwary literary writing about ${subject}
writing about ${subject} by Yash Kant Tiwary
essays about ${subject} by Yash Kant Tiwary
reflections about ${subject} by Yash Kant Tiwary
poems about ${subject} by Yash Kant Tiwary
read Yash Kant Tiwary on ${subject}
Yash Kant Tiwary ${subject} writing
Yash Kant Tiwary ${subject} essays
Yash Kant Tiwary ${subject} poems`).join('\n')}
        </div>
      </div>
    </main>
  );
}
