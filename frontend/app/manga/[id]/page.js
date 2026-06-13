import { AuthProvider } from '../../../lib/auth';
import MangaDetailClient from './MangaDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.manireader.online';
  try {
    const res = await fetch(`${apiUrl}/api/manga/${id}`, { next: { revalidate: 3600 } });
    const r = await res.json();
    const manga = r.data || r;
    
    return {
      title: `${manga.title} — Mani Reader`,
      description: manga.description?.substring(0, 160) || `Read ${manga.title} on Mani Reader.`,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://manireader.online'}/manga/${id}`,
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
  const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.manireader.online';
  
  // Fetch initial data for JSON-LD and initial rendering
  let manga = null;
  let chapters = [];
  try {
    const [mangaRes, chaptersRes] = await Promise.all([
      fetch(`${apiUrl}/api/manga/${id}`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => null),
      fetch(`${apiUrl}/api/chapters/${id}`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => null)
    ]);
    manga = mangaRes?.data || mangaRes;
    chapters = chaptersRes?.data?.chapters || chaptersRes?.chapters || [];
  } catch (e) {
    console.error('Manga details server-side fetch failed:', e);
  }

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
      <MangaDetailClient id={id} initialManga={manga} initialChapters={chapters} />
    </AuthProvider>
  );
}
