import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ClientProviders from '../components/ClientProviders';
import Footer from '../components/Footer';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], display: 'swap' });
import ScrollToTop from '../components/ScrollToTop';
import '../styles/globals.css';

import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6c63ff',
};

export const metadata = {
  metadataBase: new URL('https://manireader.online'),
  title: {
    default: 'Mani Reader — Discover Your Next Hidden Gem',
    template: '%s | Mani Reader'
  },
  description: 'Mani Reader — Your premium ad-free manga sanctuary with libraries and bookmarks.',
  authors: [{ name: 'Mani Reader Team' }],
  creator: 'Mani Reader',
  publisher: 'Mani Reader',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.jpeg', sizes: '48x48', type: 'image/jpeg' },
      { url: '/icon.jpeg', sizes: 'any' },
    ],
    apple: '/icon.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://manireader.online',
    siteName: 'Mani Reader',
    title: 'Mani Reader — Discover Your Next Hidden Gem',
    description: 'Your premium ad-free manga reader with libraries and bookmarks.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mani Reader - Premium Manga Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mani Reader — Discover Your Next Hidden Gem',
    description: 'Your premium ad-free manga reader with libraries and bookmarks.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`notranslate ${inter.className} ${outfit.className}`} translate="no">
      <head>
        <meta name="google" content="notranslate" />
                {/* Using next/font for optimal loading */}
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {/* Fonts are loaded via next/font/google in the component */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              'name': 'Mani Reader',
              'url': 'https://manireader.online',
              'description': 'Premium ad-free manga reader sanctuary.',
              'potentialAction': {
                '@type': 'SearchAction',
                'target': 'https://manireader.online/browse?keyword={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4938022536946038"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <ClientProviders>
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
