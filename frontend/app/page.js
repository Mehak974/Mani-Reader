import HomeClient from './HomeClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'ManiReader — Discover Your Next Hidden Gem',
  description: 'ManiReader — Read manga and manhwa online. Premium manga sanctuary with libraries, bookmarks, and offline gems.',
  alternates: {
    canonical: 'https://manireader.online',
  },
  openGraph: {
    title: 'ManiReader — Read manga and manhwa online',
    description: 'Read manga and manhwa online in a premium gemstone-themed sanctuary.',
    url: 'https://manireader.online',
    siteName: 'ManiReader',
    images: [
      {
        url: 'https://manireader.online/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mani Reader',
    url: 'https://manireader.online',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://manireader.online/browse?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const rawApiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.manireader.online';
  const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
  
  // Let components load client-side with skeletons to prevent blocking server-side rendering
  // and make the initial homepage load instantaneous (0ms block).
  const initialData = {
    fantasy: [],
    action: [],
    romance: [],
    recent: [],
    recentTotalPages: 1,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Mani Reader - Read Manga, Manhwa, and Manhua Online
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeClient initialData={initialData} />
      </Suspense>
    </>
  );
}

