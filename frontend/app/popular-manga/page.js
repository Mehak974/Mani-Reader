// frontend/app/popular-manga/page.js  —  Server Component
import { Suspense } from 'react';
import BrowseClient from '../browse/BrowseClient';

export const metadata = {
  title: 'Popular Manga - Most Read Manga Online | Mani Reader',
  description:
    'Explore the most popular manga, manhwa, and manhua online on Mani Reader. Discover top-rated fantasy, action, romance, and supernatural series read by the community.',
  alternates: {
    canonical: 'https://manireader.online/popular-manga',
  },
  keywords: [
    'popular manga',
    'most read manga',
    'top manga online',
    'popular manhwa',
    'popular manhua',
  ],
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Popular Manga List',
  description: 'Most popular and trending manga titles on Mani Reader.',
  url: 'https://manireader.online/popular-manga',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'Popular Manga', item: 'https://manireader.online/popular-manga' },
  ],
};

export default function PopularMangaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Suspense fallback={<div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-3)', background: 'var(--bg)', minHeight: '100vh' }}>Loading popular manga...</div>}>
        <BrowseClient defaultOrder={5} />
      </Suspense>
    </>
  );
}
