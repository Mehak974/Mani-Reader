'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function MangaCard({ manga, showNsfw = false }) {
  if (!manga) return null;

  const isBlurred = manga.nsfw && !showNsfw;
  const rawCover = manga.image || manga.cover;
  const coverUrl = rawCover
    ? (rawCover.startsWith('http') ? rawCover : `/api/image?url=${encodeURIComponent(rawCover)}`)
    : '/placeholder-cover.jpg';

  return (
    <Link href={`/manga/${manga.id}`} className="manga-card" style={{ display: 'block' }}>
      <div className="manga-card-cover">
        <img
          src={coverUrl}
          alt={manga.title}
          loading="lazy"
          className={isBlurred ? 'blur-nsfw' : ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }}
        />
        <div className="manga-card-overlay" />

        {manga.nsfw && (
          <span className="manga-card-badge badge-nsfw">18+</span>
        )}
        <span className="manga-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{manga.type || 'Manga'}</span>
          {manga.rating && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>★ {manga.rating}</span>}
        </span>
        {manga.rating && (
          <span className="manga-card-badge badge-rating" style={{ 
            background: 'rgba(255, 193, 7, 0.95)', 
            color: '#000',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '6px',
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            zIndex: 2
          }}>
            <span className="material-icons" style={{ fontSize: '0.9rem' }}>star</span>
            {manga.rating}
          </span>
        )}
        {manga.status && (
          <span className="badge-status">{manga.status}</span>
        )}
      </div>

      <div className="manga-card-body">
        <div className="manga-card-title" style={{ marginBottom: '4px' }}>{manga.title}</div>
        {manga.lastChapter && (
          <div 
            onClick={(e) => {
              if (manga.lastChapterId) {
                e.preventDefault();
                window.location.href = `/manga/${manga.id}/${manga.lastChapterId}`;
              }
            }}
            style={{ 
              fontSize: '0.75rem', 
              color: 'var(--accent)', 
              fontWeight: 600,
              cursor: manga.lastChapterId ? 'pointer' : 'default',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => { if (manga.lastChapterId) e.target.style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; }}
          >
            {manga.lastChapter}
          </div>
        )}
      </div>
    </Link>
  );
}
