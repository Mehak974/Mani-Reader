import { Suspense } from 'react';
import BrowseClient from './BrowseClient';

export const metadata = {
  title: 'Browse Manga - Mani Reader',
  description: 'Explore our vast collection of manga, manhwa, and manhua with advanced filtering.',
  alternates: {
    canonical: 'https://manireader.online/browse',
  },
};

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Loading browse...</div>}>
      <BrowseClient />
    </Suspense>
  );
}
