'use client';
import Link from 'next/link';

function getCoverUrl(manga) {
  const rawCover = manga?.image || manga?.cover;
  if (!rawCover) return '/placeholder-cover.jpg';
  if (!rawCover.startsWith('http')) return rawCover;

  const safeDomains = [
    'image.tmdb.org', 'imgur.com', 'blogspot.com', 'googleusercontent.com',
    'placehold.co', 'wp.com', 'cloudinary.com',
    'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com',
  ];
  if (safeDomains.some(d => rawCover.includes(d))) return rawCover;
  if (rawCover.includes('/api/image') || rawCover.includes('workers.dev')) return rawCover;

  return `/api/image?url=${encodeURIComponent(rawCover)}`;
}

export default function MangaCard({ manga, revealNsfw = false, setRevealNsfw = () => {}, priority = false }) {
  if (!manga) return null;

  const isBlurred = manga.nsfw && !revealNsfw;
  const coverUrl = getCoverUrl(manga);

  return (
    <div className="manga-card-wrapper" style={{ position: 'relative', height: '100%' }}>
      <Link
        href={`/manga/${manga.id}`}
        className="manga-card"
        style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
        onClick={(e) => {
          if (isBlurred) {
            e.preventDefault();
            setRevealNsfw(true);
          }
        }}
        onMouseEnter={() => {
          if (!isBlurred) {
            window.mangaTimeout = setTimeout(() => {
              fetch(`/api/manga/${manga.id}`).catch(() => { });
              fetch(`/api/chapters/${manga.id}`).catch(() => { });
            }, 150);
          }
        }}
        onMouseLeave={() => clearTimeout(window.mangaTimeout)}
      >
        <div className="manga-card-cover" style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden', borderRadius: '16px' }}>
          <img
            src={coverUrl}
            alt={manga.title}
            loading={priority ? "eager" : "lazy"}
            className={`manga-cover-img ${isBlurred ? 'blur-nsfw' : ''}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }}
          />
          <div className="manga-card-overlay" />

          {isBlurred && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', zIndex: 3,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              padding: '16px', textAlign: 'center', transition: 'all 0.3s'
            }}>
              <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', lineHeight: '1.4' }}>
                Content is 18+ contain nudity want to reveal?
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setRevealNsfw(true); }}
                className="reveal-btn"
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem',
                  fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                YES, REVEAL ALL
              </button>
            </div>
          )}

          {manga.nsfw && <span className="manga-card-badge badge-nsfw">18+</span>}

          {manga.rating && (
            <span className="manga-card-badge badge-rating" style={{
              background: 'rgba(255, 193, 7, 0.95)', color: '#000', fontWeight: 800,
              fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px',
              position: 'absolute', top: '10px', right: '10px',
              display: 'flex', alignItems: 'center', gap: '4px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 2
            }}>
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>star</span>
              {manga.rating}
            </span>
          )}

          <span className="manga-card-meta" style={{
            position: 'absolute', bottom: '10px', left: '10px', right: '10px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            zIndex: 2, fontSize: '0.7rem', fontWeight: 600, color: '#fff'
          }}>
            <span>{manga.type || 'Manga'}</span>
            {manga.status && <span style={{ opacity: 0.8 }}>{manga.status}</span>}
          </span>
        </div>

        <div className="manga-card-body" style={{ padding: '12px 10px', minHeight: '80px' }}>
          <div className="manga-card-title" style={{
            fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: '1.3', marginBottom: '4px'
          }}>
            {manga.title}
          </div>
        </div>
      </Link>

      {manga.lastChapter && manga.lastChapterId && (
        <Link
          href={`/read/${manga.lastChapterId}?mangaId=${manga.id}`}
          style={{
            position: 'absolute', bottom: '12px', left: '0',
            fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600,
            textDecoration: 'none', maxWidth: '100%', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 5, padding: '0 10px'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          {manga.lastChapter}
        </Link>
      )}
    </div>
  );
}