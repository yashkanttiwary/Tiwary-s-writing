import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getWritingBySlug, getWritings } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { LiteraryRenderer } from '@/components/literary/LiteraryRenderer';
import ReadingModeWrapper from '@/components/literary/ReadingModeWrapper';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import AppreciationButton from '@/components/literary/AppreciationButton';
import DownloadButton from '@/components/literary/DownloadButton';

interface Props {
  params: Promise<{ year: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  
  if (!writing) return {};
  const { title, excerpt, publishedAt, tags, type } = writing.metadata;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tiwaryswriting.vercel.app';
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
      images: [
        {
          url: `${siteUrl}/icon.png`,
          width: 512,
          height: 512,
          alt: 'Tiwary’s Writing',
        }
      ],
    },
    twitter: {
      card: 'summary',
      title: title || 'Untitled',
      description: excerpt || `A ${type} by Yash Kant Tiwary.`,
      images: [`${siteUrl}/icon.png`],
    }
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
  const currentIndex = allWritings.findIndex(w => w.metadata.id === writing.metadata.id);
  const next = currentIndex > 0 ? allWritings[currentIndex - 1] : null; // Because array is sorted descending (newest first), index 0 is newest. So next (newer) is -1. Wait, normally "Next" means older? Let's keep it as is.
  const prev = currentIndex !== -1 && currentIndex < allWritings.length - 1 ? allWritings[currentIndex + 1] : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tiwaryswriting.vercel.app';
  const url = `${siteUrl}/writing/${writing.year}/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
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
      <main className="min-h-screen bg-[var(--color-canvas)] pb-24">
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
            {writing.metadata.collections && writing.metadata.collections.length > 0 && (
              <Link href={`/collections?name=${encodeURIComponent(writing.metadata.collections[0])}`} className="hidden sm:inline-flex items-center gap-2 text-sm font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                <span>{writing.metadata.collections[0]}</span>
              </Link>
            )}
          </div>
          <div>
            <DownloadButton title={title || 'Untitled'} />
          </div>
        </nav>

        <article className="px-6 sm:px-12 pt-6 sm:pt-12" lang={language === 'hi' ? 'hi' : 'en'}>
          <div id="writing-capture-area" className="bg-[var(--color-canvas)] py-12 px-6 sm:px-12 -mx-6 sm:-mx-12 rounded-none sm:rounded-xl">
            <header className="max-w-[var(--spacing-reading-prose)] mx-auto w-full text-center mb-12 sm:mb-16">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--color-ink)] leading-tight ${language === 'hi' ? 'font-devanagari' : ''}`}>
                {title || 'Untitled'}
              </h1>
              <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm font-sans text-[var(--color-ink-faint)] tracking-wide">
                <time dateTime={publishedAt as string}>{formatDate(publishedAt as string)}</time>
                <span className="capitalize">{type}</span>
              </div>
            </header>

            {/* The Writing */}
            <section className="mb-16 sm:mb-20">
              <LiteraryRenderer writing={writing} />
            </section>
            
            <div className="max-w-[var(--spacing-reading-prose)] mx-auto w-full text-center text-sm font-sans text-[var(--color-ink-faint)] pb-4">
              <p>Yash Kant Tiwary</p>
            </div>
          </div>

          {/* Interaction */}
          <footer className="max-w-[var(--spacing-reading-prose)] mx-auto w-full border-t border-[var(--color-border)] pt-8 flex flex-col items-center gap-8 mt-4">
             <AppreciationButton />
          </footer>
        </article>

        {/* Discovery Paths */}
        <section className="discovery-section mt-20 max-w-4xl mx-auto px-6 text-center">
          <div className="h-px bg-[var(--color-border)] w-12 mx-auto mb-10"></div>
          <p className="text-sm font-sans uppercase tracking-widest text-[var(--color-ink-faint)] mb-8">Continue Wandering</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
             {prev ? (
               <Link href={`/writing/${prev.year}/${prev.metadata.slug}`} className="block group border border-[var(--color-border)] p-6 hover:border-[var(--color-ink-faint)] transition-colors">
                 <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Previous</div>
                 <h4 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                   {prev.metadata.title || "Untitled"}
                 </h4>
               </Link>
             ) : (
               <Link href="/archive" className="block group border border-[var(--color-border)] p-6 hover:border-[var(--color-ink-faint)] transition-colors">
                 <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Return to</div>
                 <h4 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                   The Archive
                 </h4>
               </Link>
             )}
             
             {next ? (
               <Link href={`/writing/${next.year}/${next.metadata.slug}`} className="block group border border-[var(--color-border)] p-6 hover:border-[var(--color-ink-faint)] transition-colors md:text-right">
                 <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Next</div>
                 <h4 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                   {next.metadata.title || "Untitled"}
                 </h4>
               </Link>
             ) : (
               <Link href="/random" className="block group border border-[var(--color-border)] p-6 hover:border-[var(--color-ink-faint)] transition-colors md:text-right">
                 <div className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Discover</div>
                 <h4 className="text-xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors">
                   Random Poem
                 </h4>
               </Link>
             )}
          </div>
        </section>
      </main>
    </ReadingModeWrapper>
  );
}
