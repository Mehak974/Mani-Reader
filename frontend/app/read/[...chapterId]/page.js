'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AuthProvider } from '../../../lib/auth';
import { VerticalReader, PagedReader } from '../../../components/Reader';
import { mangaApi } from '../../../lib/api';

function ReaderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Handle catch-all route [...chapterId] which returns an array
  const chapterId = Array.isArray(params.chapterId) 
    ? params.chapterId.join('/') 
    : params.chapterId;

  const mangaId = searchParams.get('mangaId') || '';

  const [pages,       setPages]       = useState([]);
  const [externalUrl, setExternalUrl] = useState(null);
  const [chapters,    setChapters]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [mode,        setMode]        = useState('vertical'); // 'vertical' | 'paged'

  useEffect(() => {
    Promise.all([
      mangaApi.pages(chapterId, mangaId).then((r) => {
        setPages(r.data.pages || []);
        setExternalUrl(r.data.externalUrl || null);
      }),
      mangaId ? mangaApi.chapters(mangaId).then((r) => setChapters(r.data.chapters || [])) : Promise.resolve(),
    ])
      .catch((e) => setError(e.response?.data?.error || 'Failed to load chapter'))
      .finally(() => setLoading(false));
  }, [chapterId, mangaId]);

  // Find adjacent chapters
  const currentIdx = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1]?.id : null;
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1]?.id : null;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚡</div>
        Loading chapter...
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--red)' }}>
        <div style={{ marginBottom: 16 }}>{error}</div>
        <a href={mangaId ? `/manga/${mangaId}` : '/'} style={{ color: 'var(--accent)' }}>← Back</a>
      </div>
    </div>
  );
  
  if (pages.length === 0 && externalUrl) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white', maxWidth: 400, padding: 20 }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔗</div>
        <h2 style={{ marginBottom: 12 }}>External Chapter</h2>
        <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>
          This chapter is hosted on an external platform and cannot be read directly here.
        </p>
        <a 
          href={externalUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 16 }}
        >
          Read on Official Source
        </a>
        <a href={mangaId ? `/manga/${mangaId}` : '/'} style={{ color: 'var(--accent)', display: 'block' }}>← Back to Manga</a>
      </div>
    </div>
  );

  // Find current chapter object
  const currentChapter = chapters.find((c) => c.id === chapterId);

  return (
    <div>
      {mode === 'vertical' ? (
        <VerticalReader
          pages={pages}
          chapterId={chapterId}
          mangaId={mangaId}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          currentChapter={currentChapter}
        />
      ) : (
        <PagedReader
          pages={pages}
          chapterId={chapterId}
          mangaId={mangaId}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          currentChapter={currentChapter}
        />
      )}
    </div>
  );
}

export default function ReaderPage() {
  return <AuthProvider><ReaderContent /></AuthProvider>;
}
