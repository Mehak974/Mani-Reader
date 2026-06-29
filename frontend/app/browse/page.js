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
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Browse Manga, Manhwa &amp; Manhua - Mani Reader
      </h1>
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Loading browse...</div>}>
        <BrowseClient />
      </Suspense>
    </>
  );
}
