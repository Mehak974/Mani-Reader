// frontend/app/latest-manga/page.js  —  Server Component
import { Suspense } from 'react';
import BrowseClient from '../browse/BrowseClient';

export const metadata = {
  title: 'Latest Manga Updates - Recently Added Chapters | Mani Reader',
  description:
    'Check the latest manga updates and recently added chapters on Mani Reader. Read new releases of action, fantasy, romance, adventure, and drama series online.',
  alternates: {
    canonical: 'https://manireader.online/latest-manga',
  },
  keywords: [
    'latest manga updates',
    'recent manga chapters',
    'new manga releases',
    'manhwa updates',
    'manhua updates',
  ],
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Latest Manga Updates',
  description: 'Recently released and updated manga chapters on Mani Reader.',
  url: 'https://manireader.online/latest-manga',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'Latest Updates', item: 'https://manireader.online/latest-manga' },
  ],
};

export default function LatestMangaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Suspense fallback={<div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-3)', background: 'var(--bg)', minHeight: '100vh' }}>Loading latest updates...</div>}>
        <BrowseClient defaultOrder={0} />
      </Suspense>
    </>
  );
}
