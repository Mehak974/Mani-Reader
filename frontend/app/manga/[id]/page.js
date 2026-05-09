import { AuthProvider } from '../../../lib/auth';
import MangaDetailClient from './MangaDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(`http://localhost:4000/api/manga/${id}`, { next: { revalidate: 3600 } });
    const r = await res.json();
    const manga = r.data || r;
    
    return {
      title: `${manga.title} — Mani Reader`,
      description: manga.description?.substring(0, 160) || `Read ${manga.title} on Mani Reader.`,
      alternates: {
        canonical: `http://localhost:3001/manga/${id}`,
      },
      openGraph: {
        title: manga.title,
        description: manga.description,
        images: manga.cover ? [{ url: manga.cover }] : [],
      },
    };
  } catch (e) {
    return { title: 'Manga Detail — Mani Reader' };
  }
}

export default async function MangaPage({ params }) {
  const { id } = await params;
  
  // Fetch initial data for JSON-LD structured data
  let manga = null;
  try {
    const res = await fetch(`http://localhost:4000/api/manga/${id}`, { next: { revalidate: 3600 } });
    const r = await res.json();
    manga = r.data || r;
  } catch (e) {}

  const jsonLd = manga ? {
    '@context': 'https://schema.org',
    '@type': 'Book',
    'name': manga.title,
    'description': manga.description,
    'image': manga.cover,
    'genre': manga.genres,
    'aggregateRating': manga.averageRating ? {
      '@type': 'AggregateRating',
      'ratingValue': manga.averageRating,
      'bestRating': '5',
      'worstRating': '1',
      'ratingCount': manga.readCount || '1',
    } : undefined,
  } : null;

  return (
    <AuthProvider>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MangaDetailClient id={id} initialManga={manga} />
    </AuthProvider>
  );
}
