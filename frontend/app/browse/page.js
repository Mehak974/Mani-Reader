import BrowseClient from './BrowseClient';

export const metadata = {
  title: 'Browse Manga - Mani Reader',
  description: 'Explore our vast collection of manga, manhwa, and manhua with advanced filtering.',
  alternates: {
    canonical: 'http://localhost:3001/browse',
  },
};

export default function BrowsePage() {
  return <BrowseClient />;
}
