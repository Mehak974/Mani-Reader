import HomeClient from './HomeClient';

export const metadata = {
  title: 'Mani Reader — Discover Your Next Hidden Gem',
  description: 'Mani Reader — Your premium manga sanctuary with libraries, bookmarks, and offline gems.',
  alternates: {
    canonical: 'https://manireader.online',
  },
  openGraph: {
    title: 'Mani Reader — Premium Manga Experience',
    description: 'Discover, organize, and read your favorite stories in a refined, gemstone-themed experience.',
    images: [{ url: '/og-image.png' }],
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
