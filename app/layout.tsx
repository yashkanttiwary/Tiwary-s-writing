import type { Metadata } from 'next';
import { Crimson_Pro, Noto_Serif_Devanagari, Inter } from 'next/font/google';
import GlobalNav from '@/components/GlobalNav';
import './globals.css';

const crimsonPro = Crimson_Pro({ 
  subsets: ['latin'],
  variable: '--font-crimson-pro',
  display: 'swap',
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: '--font-noto-serif-devanagari',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tiwaryswriting.vercel.app'),
  title: {
    default: 'Tiwary’s Writing',
    template: '%s | Tiwary’s Writing',
  },
  description: 'A life, left in words. A living literary archive of Yash Kant Tiwary.',
  openGraph: {
    title: 'Tiwary’s Writing',
    description: 'A life, left in words. A living literary archive of Yash Kant Tiwary.',
    url: '/',
    siteName: 'Tiwary’s Writing',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
      'application/feed+json': '/feed.json',
    },
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${notoSerifDevanagari.variable} ${inter.variable}`}>
      <body className="font-serif bg-[#fdfcf9] text-[#1a1a1a] antialiased selection:bg-[#e0ddd0] selection:text-[#1a1a1a]" suppressHydrationWarning>
        {children}
        <GlobalNav />
      </body>
    </html>
  );
}
