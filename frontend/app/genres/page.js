// frontend/app/genres/page.js  —  Server Component
import GenresContent from './GenresContent';

export const metadata = {
  title: 'Manga Genres Directory - Explore Manga, Manhwa & Manhua | Mani Reader',
  description:
    'Browse the full list of manga, manhwa, and manhua genres. Find action, fantasy, romance, comedy, horror, adventure, thriller, slice of life, and more series on Mani Reader.',
  alternates: {
    canonical: 'https://manireader.online/genres',
  },
  keywords: [
    'manga genres',
    'explore manga',
    'read manhwa genres',
    'action manga list',
    'fantasy manga list',
    'romance manhwa list',
  ],
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Manga Genres Directory',
  description: 'Explore manga, manhwa, and manhua categorized by genre on Mani Reader.',
  url: 'https://manireader.online/genres',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'Genres', item: 'https://manireader.online/genres' },
  ],
};

export default function GenresPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <GenresContent />
    </>
  );
}
