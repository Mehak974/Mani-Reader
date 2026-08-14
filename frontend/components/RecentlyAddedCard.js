'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getApiServerUrl } from '../lib/api';

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

export default function RecentlyAddedCard({ manga }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  if (!manga) return null;

  const rawCover = manga.image || manga.cover;
  const safeDomains = ['image.tmdb.org', 'imgur.com', 'blogspot.com', 'googleusercontent.com', 'placehold.co', 'wp.com', 'cloudinary.com', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com'];

  let targetUrl = rawCover;
  if (rawCover && rawCover.includes('/api/image')) {
    const match = rawCover.match(/[?&]url=([^&]+)/);
    if (match && match[1]) targetUrl = decodeURIComponent(match[1]);
  }

  const coverUrl = !targetUrl
    ? '/placeholder-cover.jpg'
    : (!targetUrl.startsWith('http') || safeDomains.some(d => targetUrl.includes(d)))
      ? targetUrl
      : `/api/image?url=${encodeURIComponent(targetUrl)}`;

  const slug = getSlug(manga.id);
  const displayChapters = manga.latestChapters && manga.latestChapters.length > 0
    ? manga.latestChapters
    : (manga.lastChapterId ? [{ title: manga.lastChapter || 'Read Now', id: manga.lastChapterId, time: manga.updateDate || 'Just now' }] : []);

  const apiBase = getApiServerUrl();

  return (
    <div
      className="recent-added-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        gap: '14px',
        background: 'var(--bg-2)',
        borderRadius: '16px',
        padding: '14px',
        border: `1px solid ${isHovered ? 'var(--accent)' : 'var(--border)'}`,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.3)' : 'none',
        height: '100%',
        position: 'relative'
      }}
    >
      <Link
        href={`/manga/${slug}`}
        style={{ flexShrink: 0 }}
      >
        <div style={{
          width: 'clamp(80px, 20vw, 100px)',
          height: 'clamp(112px, 28vw, 140px)',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <img
            src={coverUrl}
            alt={manga.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }}
          />
        </div>
      </Link>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'flex-start' }}>
        <Link href={`/manga/${slug}`}>
          <h3 style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--accent)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = 'var(--accent)'}
          >
            {manga.title}
          </h3>
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {displayChapters.map((ch, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
              <Link 
                href={`/read/${ch.id}?mangaId=${slug}`} 
                style={{ 
                  color: 'var(--text-2)', 
                  textDecoration: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-2)'}
              >
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>»</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title || `Chapter ${ch.number || ''}`}</span>
              </Link>
              <span style={{ color: 'var(--text-3)', fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', fontStyle: 'normal', whiteSpace: 'nowrap' }}>
                {ch.time || 'Just now'}
              </span>
            </div>
          ))}
          {displayChapters.length === 0 && (
            <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>No chapters yet</span>
          )}
        </div>
      </div>
    </div>
  );
}