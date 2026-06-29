// frontend/app/how-it-works/page.js  —  Server Component
import HowContent from './HowContent';

export const metadata = {
  title: 'How It Works - Manga Sync & Indexing Technology | Mani Reader',
  description:
    'Learn how Mani Reader works to synchronize, index, and load manga, manhwa, and manhua chapters. Discover our ad-light, fast interface technology.',
  alternates: {
    canonical: 'https://manireader.online/how-it-works',
  },
  keywords: [
    'how Mani Reader works',
    'manga sync technology',
    'indexing manga',
    'manga reader client',
    'fast manga reader website',
  ],
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'How Mani Reader Works',
  description: 'Technical details about Mani Reader indexing, chapter sync, and rendering optimization.',
  url: 'https://manireader.online/how-it-works',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'How It Works', item: 'https://manireader.online/how-it-works' },
  ],
};

export default function HowPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <HowContent />
    </>
  );
}
