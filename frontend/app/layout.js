import { Analytics } from '@vercel/analytics/next';
import ClientProviders from '../components/ClientProviders';
import '../styles/globals.css';

import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://manireader.online'),
  title: {
    default: 'Mani Reader — Discover Your Next Hidden Gem',
    template: '%s | Mani Reader'
  },
  description: 'Mani Reader — Your premium manga sanctuary with libraries, bookmarks, and offline gems.',
  keywords: ['manga', 'reader', 'manhwa', 'manhua', 'reading', 'offline manga', 'mani reader'],
  authors: [{ name: 'Mani Reader Team' }],
  creator: 'Mani Reader',
  publisher: 'Mani Reader',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.jpeg' },
      { url: '/icon.jpeg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/icon.jpeg', sizes: '48x48', type: 'image/jpeg' },
    ],
    shortcut: '/icon.jpeg',
    apple: '/icon.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://manireader.online',
    siteName: 'Mani Reader',
    title: 'Mani Reader — Discover Your Next Hidden Gem',
    description: 'Your premium manga sanctuary with libraries, bookmarks, and offline gems.',
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
    description: 'Your premium manga sanctuary with libraries, bookmarks, and offline gems.',
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons&display=swap" rel="stylesheet" />
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4938022536946038"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <ClientProviders>
          <main id="main-content">
            {children}
          </main>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
