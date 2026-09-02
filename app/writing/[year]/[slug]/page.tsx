import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getWritingBySlug, getWritings } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { LiteraryRenderer } from '@/components/literary/LiteraryRenderer';
import ReadingModeWrapper from '@/components/literary/ReadingModeWrapper';
import { ArrowLeft, Heart } from 'lucide-react';

interface Props {
  params: Promise<{ year: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  
  if (!writing) return {};

  const { title, excerpt, publishedAt, tags, type } = writing.metadata;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  const url = `${siteUrl}/writing/${writing.year}/${slug}`;

  return {
    title: title || 'Untitled',
    description: excerpt || `A ${type} by Yash Kant Tiwary, published on ${publishedAt}.`,
    alternates: {
      canonical: url,
      types: {
        'application/json': `${siteUrl}/api/v1/writings/${writing.metadata.id}`,
        'text/markdown': `${siteUrl}/api/v1/writings/${writing.metadata.id}.md`,
      }
    },
    openGraph: {
      title: title || 'Untitled',
      description: excerpt || `A ${type} by Yash Kant Tiwary.`,
      url,
      type: 'article',
      publishedTime: publishedAt as string,
      authors: ['Yash Kant Tiwary'],
      tags: tags,
    },
  };
}

export async function generateStaticParams() {
  const writings = await getWritings();
  return writings.map((w) => ({
    year: w.year,
    slug: w.metadata.slug,
  }));
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  let writing = null;
  
  try {
    writing = await getWritingBySlug(slug);
  } catch (err) {
    console.error(`Error fetching writing with slug ${slug}:`, err);
  }

  if (!writing) {
    notFound();
  }

  const { title, publishedAt, type, language } = writing.metadata;
  
  const allWritings = await getWritings();
  const related = allWritings
    .filter(w => w.metadata.id !== writing.metadata.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  const url = `${siteUrl}/writing/${writing.year}/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork', // or BlogPosting, Article
    headline: title || 'Untitled',
    description: writing.metadata.excerpt || `A ${type} by Yash Kant Tiwary.`,
    author: {
      '@type': 'Person',
      name: 'Yash Kant Tiwary',
      url: siteUrl,
    },
    datePublished: publishedAt as string,
    dateModified: writing.metadata.updatedAt || publishedAt as string,
    genre: type,
    keywords: writing.metadata.tags?.join(', '),
    url: url,
    inLanguage: language || 'en',
    publisher: {
      '@type': 'Person',
      name: 'Yash Kant Tiwary'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };

  return (
    <ReadingModeWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[var(--color-canvas)] pb-32">
        {/* Minimal Navigation */}
        <nav className="py-8 px-6 sm:px-12 max-w-5xl mx-auto w-full flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              <ArrowLeft size={14} />
              <span>Home</span>
            </Link>
            <Link href="/archive" className="inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              <span>Archive</span>
            </Link>
          </div>
        </nav>

        <article className="px-6 sm:px-12 pt-10 sm:pt-20">
          <header className="max-w-[var(--spacing-reading-prose)] mx-auto w-full text-center mb-16 sm:mb-24">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--color-ink)] leading-tight ${language === 'hi' ? 'font-devanagari' : ''}`}>
              {title || 'Untitled'}
            </h1>
            <div className="mt-6 sm:mt-10 flex flex-col items-center justify-center gap-2 text-sm font-sans text-[var(--color-ink-faint)] tracking-wide">
              <time dateTime={publishedAt as string}>{formatDate(publishedAt as string)}</time>
              <span className="capitalize">{type}</span>
            </div>
          </header>

          {/* The Writing */}
          <section className="mb-24 sm:mb-32">
            <LiteraryRenderer writing={writing} />
          </section>

          {/* Interaction */}
          <footer className="max-w-[var(--spacing-reading-prose)] mx-auto w-full border-t border-[var(--color-border)] pt-12 flex flex-col items-center gap-12">
             <button className="group flex flex-col items-center gap-3 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
               <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-ink)] transition-colors">
                 <Heart size={18} className="group-hover:fill-current" />
               </div>
               <span className="font-serif italic text-lg tracking-wide">Appreciate</span>
             </button>
             
             <div className="text-center text-sm font-sans text-[var(--color-ink-faint)]">
               <p>Yash Kant Tiwary</p>
             </div>
          </footer>
        </article>

        {/* Discovery Paths */}
        {related.length > 0 && (
          <section className="discovery-section mt-32 max-w-2xl mx-auto px-6 text-center">
            <div className="h-px bg-[var(--color-border)] w-12 mx-auto mb-12"></div>
            <p className="text-sm font-sans uppercase tracking-widest text-[var(--color-ink-faint)] mb-8">Continue Wandering</p>
            <div className="flex flex-col gap-8">
               {related.map(r => (
                 <Link key={r.metadata.id} href={`/writing/${r.year}/${r.metadata.slug}`} className="block group">
                   <h4 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                     {r.metadata.title || "Untitled"}
                   </h4>
                   <div className="text-sm font-sans text-[var(--color-ink-faint)] mt-2">
                     {formatDate(r.metadata.publishedAt as string)}
                   </div>
                 </Link>
               ))}
            </div>
          </section>
        )}
      </main>
    </ReadingModeWrapper>
  );
}
