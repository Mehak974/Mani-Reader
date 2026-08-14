import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ClientProviders from '../components/ClientProviders';
import Footer from '../components/Footer';
import { Inter, Outfit } from 'next/font/google';
import ScrollToTop from '../components/ScrollToTop';
import Script from 'next/script';
import MaterialIconsLoader from '../components/MaterialIconsLoader';
import '../styles/globals.css';

// next/font handles font loading with optimal preloading — no @import needed in CSS
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-outfit',
});

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
    template: '%s | Mani Reader',
  },
  description: 'Mani Reader — Your premium manga reader with libraries and bookmarks.',
  authors: [{ name: 'Mani Reader Team' }],
  creator: 'Mani Reader',
  publisher: 'Mani Reader',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.png', sizes: 'any' },
    ],
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://manireader.online',
    siteName: 'Mani Reader',
    title: 'Mani Reader — Discover Your Next Hidden Gem',
    description: 'Mani Reader — Your premium manga reader with libraries and bookmarks.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Mani Reader - Premium Manga Experience' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mani Reader — Discover Your Next Hidden Gem',
    description: 'Mani Reader — Your premium manga reader with libraries and bookmarks.',
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`notranslate ${inter.variable} ${outfit.variable} ${inter.className}`}
      translate="no"
    >
      <head>
        {/*
          ✅ Preconnect only to critical origins needed before first paint.
          Material Icons are deferred — they must NOT block LCP.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.manireader.online" />
        <link rel="dns-prefetch" href="https://fonts.material.io" />

        <meta name="google" content="notranslate" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Mani Reader',
              url: 'https://manireader.online',
              description: 'Mani Reader — Premium manga reader with libraries and bookmarks.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://manireader.online/browse?keyword={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <MaterialIconsLoader />
        <ClientProviders>
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
        </ClientProviders>

        <Analytics />
        <SpeedInsights />
        <script src="https://revolthem.com/17/fa/2a/17fa2a0abb1619ea7086df42c7fa7d40.js" />
        <script src="https://revolthem.com/a4/d5/83/a4d5830ab740fb42a37d9777427ee81e.js" />
      </body>
    </html>
  );
}