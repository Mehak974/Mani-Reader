import HomeClient from './HomeClient';

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

export default function Home() {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
