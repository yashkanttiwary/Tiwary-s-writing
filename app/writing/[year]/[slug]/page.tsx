export const dynamic = "force-dynamic";
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
import ShareButton from '@/components/literary/ShareButton';
import BookmarkButton from '@/components/literary/BookmarkButton';

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
        <nav className="py-8 lg:py-12 px-6 sm:px-12 lg:px-16 xl:px-24 2xl:px-32 max-w-7xl 2xl:max-w-[1700px] mx-auto w-full flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-6 sm:gap-8 lg:gap-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm sm:text-base lg:text-lg font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              <ArrowLeft size={16} className="lg:w-5 lg:h-5" />
              <span>Home</span>
            </Link>
            <Link href="/archive" className="inline-flex items-center gap-2 text-sm sm:text-base lg:text-lg font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              <span>Archive</span>
            </Link>
            {writing.metadata.collections && writing.metadata.collections.length > 0 && (
              <Link href={`/collections?name=${encodeURIComponent(writing.metadata.collections[0])}`} className="hidden sm:inline-flex items-center gap-2 text-sm sm:text-base lg:text-lg font-sans text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                <span>{writing.metadata.collections[0]}</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 -mr-2">
            <BookmarkButton writing={writing} url={url} />
            <ShareButton title={title || 'Untitled'} url={url} />
            <DownloadButton title={title || 'Untitled'} writing={writing} />
          </div>
        </nav>

        <article className="px-6 sm:px-12 lg:px-16 xl:px-24 2xl:px-32 pt-6 sm:pt-10 lg:pt-16 max-w-7xl 2xl:max-w-[1700px] mx-auto w-full" lang={language === 'hi' ? 'hi' : 'en'}>
          <div id="writing-capture-area" className="bg-[var(--color-canvas)] py-10 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-8 lg:px-12 rounded-none sm:rounded-xl">
            <header className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-serif text-[var(--color-ink)] leading-tight sm:leading-snug md:leading-tight ${language === 'hi' ? 'font-devanagari' : ''}`}>
                {title || 'Untitled'}
              </h1>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg font-sans text-[var(--color-ink-faint)] tracking-wide">
                <time dateTime={publishedAt as string}>{formatDate(publishedAt as string)}</time>
                <span className="hidden sm:inline text-[var(--color-border)]">•</span>
                <span className="capitalize">{type}</span>
                {writing.metadata.language === 'hi' && (
                  <>
                    <span className="hidden sm:inline text-[var(--color-border)]">•</span>
                    <span>Hindi</span>
                  </>
                )}
              </div>
            </header>

            {/* The Writing */}
            <section className="mb-16 sm:mb-20 lg:mb-28">
              <LiteraryRenderer writing={writing} />
            </section>
            
            <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full text-center text-sm sm:text-base lg:text-lg font-sans text-[var(--color-ink-faint)] pb-4 tracking-wider">
              <p>Yash Kant Tiwary</p>
            </div>
          </div>

          {/* Interaction */}
          <footer className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full border-t border-[var(--color-border)] pt-10 sm:pt-14 flex flex-col items-center gap-8 mt-6">
             <AppreciationButton />
          </footer>
        </article>

        {/* Discovery Paths */}
        <section className="discovery-section mt-20 sm:mt-28 lg:mt-36 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 sm:px-12 text-center">
          <div className="h-px bg-[var(--color-border)] w-16 mx-auto mb-10 lg:mb-14"></div>
          <p className="text-sm sm:text-base font-sans uppercase tracking-widest text-[var(--color-ink-faint)] mb-8 lg:mb-12">Continue Wandering</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-left">
             {prev ? (
               <Link href={`/writing/${prev.year}/${prev.metadata.slug}`} className="block group border border-[var(--color-border)] p-6 sm:p-8 lg:p-10 hover:border-[var(--color-ink-faint)] transition-colors">
                 <div className="text-xs sm:text-sm uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Previous</div>
                 <h4 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-snug">
                   {prev.metadata.title || "Untitled"}
                 </h4>
               </Link>
             ) : (
               <Link href="/archive" className="block group border border-[var(--color-border)] p-6 sm:p-8 lg:p-10 hover:border-[var(--color-ink-faint)] transition-colors">
                 <div className="text-xs sm:text-sm uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Return to</div>
                 <h4 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-snug">
                   The Archive
                 </h4>
               </Link>
             )}
             
             {next ? (
               <Link href={`/writing/${next.year}/${next.metadata.slug}`} className="block group border border-[var(--color-border)] p-6 sm:p-8 lg:p-10 hover:border-[var(--color-ink-faint)] transition-colors md:text-right">
                 <div className="text-xs sm:text-sm uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Next</div>
                 <h4 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-snug">
                   {next.metadata.title || "Untitled"}
                 </h4>
               </Link>
             ) : (
               <Link href="/random" prefetch={false} className="block group border border-[var(--color-border)] p-6 sm:p-8 lg:p-10 hover:border-[var(--color-ink-faint)] transition-colors md:text-right">
                 <div className="text-xs sm:text-sm uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">Discover</div>
                 <h4 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[var(--color-ink)] group-hover:text-[var(--color-ink-muted)] transition-colors leading-snug">
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
