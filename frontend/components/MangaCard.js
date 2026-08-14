'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

function getSlug(id) {
  if (!id || typeof id !== 'string') return id;
  if (!id.startsWith('http')) return id;
  try {
    const url = new URL(id);
    return url.pathname.split('/').filter(Boolean).pop();
  } catch {
    return id;
  }
}

function getCoverUrl(manga) {
  const rawCover = manga?.image || manga?.cover || manga?.coverImage;
  if (!rawCover) return '/placeholder-cover.jpg';
  if (!rawCover.startsWith('http')) return rawCover;
  if (rawCover.includes('/api/image')) return rawCover;

  const safeDomains = [
    'image.tmdb.org', 'imgur.com', 'blogspot.com', 'googleusercontent.com',
    'placehold.co', 'wp.com', 'cloudinary.com',
    'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com',
  ];
  if (safeDomains.some(d => rawCover.includes(d))) return rawCover;

  return `/api/image?url=${encodeURIComponent(rawCover)}`;
}

export default function MangaCard({ manga, revealNsfw = false, setRevealNsfw = () => {}, priority = false }) {
  const auth = useAuth();
  const currentRevealNsfw = auth ? auth.revealNsfw : revealNsfw;
  const currentSetRevealNsfw = auth ? auth.setRevealNsfw : setRevealNsfw;

  if (!manga) return null;

  const isBlurred = manga.nsfw && !currentRevealNsfw;
  const coverUrl = getCoverUrl(manga);
  const slug = getSlug(manga.id);

  const [imgSrc, setImgSrc] = useState(coverUrl);

  // Sync if manga prop changes (e.g. list updates)
  useEffect(() => {
    setImgSrc(getCoverUrl(manga));
  }, [manga?.id, manga?.image, manga?.cover, manga?.coverImage]);

  const handleError = useCallback(() => {
    if (imgSrc !== '/placeholder-cover.jpg') {
      setImgSrc('/placeholder-cover.jpg');
    }
  }, [imgSrc]);

  return (
    <div className="manga-card-wrapper" style={{ position: 'relative', height: '100%' }}>
      <Link
        href={`/manga/${slug}`}
        className="manga-card"
        style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
        onClick={(e) => {
          if (isBlurred) {
            e.preventDefault();
            currentSetRevealNsfw(true);
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
        <div className="manga-card-cover" style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.08) 100%)' }}>
          <img
            src={imgSrc}
            alt={manga.title}
            loading={priority ? "eager" : "lazy"}
            className={`manga-cover-img ${isBlurred ? 'blur-nsfw' : ''}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onError={handleError}
          />
          <div className="manga-card-overlay" style={{ background: 'linear-gradient(to top, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.4) 50%, transparent 100%)' }} />

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
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); currentSetRevealNsfw(true); }}
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

           {manga.nsfw && <span className="manga-card-badge badge-nsfw" style={{ background: 'rgba(255, 77, 109, 0.9)', color: '#fff', padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, backdropFilter: 'blur(8px)' }}>18+</span>}

           {manga.rating && (
             <span className="manga-card-badge badge-rating" style={{
               background: 'rgba(255, 193, 7, 0.95)', color: '#000', fontWeight: 800,
               fontSize: '0.75rem', padding: '3px 10px', borderRadius: '8px',
               position: 'absolute', top: '10px', right: '10px',
               display: 'flex', alignItems: 'center', gap: '4px',
               boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 2
             }}>
               <span className="material-icons" style={{ fontSize: '0.9rem' }}>star</span>
               {manga.rating}
             </span>
           )}

           <span className="manga-card-meta" style={{
             position: 'absolute', bottom: '10px', left: '10px', right: '10px',
             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
             zIndex: 2, fontSize: '0.7rem', fontWeight: 600, color: '#fff',
             textShadow: '0 1px 4px rgba(0,0,0,0.8)'
           }}>
             <span>{manga.type || 'Manga'}</span>
             {manga.status && <span style={{ opacity: 0.9 }}>{manga.status}</span>}
           </span>
         </div>

         <div className="manga-card-body" style={{ padding: '14px 12px', minHeight: '80px', background: 'var(--surface)', borderRadius: '0 0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div className="manga-card-title" style={{
             fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)',
             display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
             overflow: 'hidden', lineHeight: '1.35', marginBottom: '4px'
           }}>
             {manga.title}
           </div>
         </div>
       </Link>

      {manga.lastChapter && manga.lastChapterId && (
        <Link
          href={`/read/${manga.lastChapterId}?mangaId=${slug}`}
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