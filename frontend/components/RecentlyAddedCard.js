'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getApiServerUrl } from '../lib/api';

export default function RecentlyAddedCard({ manga }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  if (!manga) return null;

  const serverUrl = getApiServerUrl(); // e.g. 'https://api.manireader.online' in prod, '' locally
  const rawCover = manga.image || manga.cover;
  const safeDomains = ['image.tmdb.org', 'imgur.com', 'blogspot.com', 'googleusercontent.com', 'placehold.co', 'wp.com', 'cloudinary.com', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com'];
  const coverUrl = rawCover
    ? (rawCover.startsWith('http') && !rawCover.includes('/api/image') && !rawCover.includes('workers.dev') && !safeDomains.some(d => rawCover.includes(d))
      ? `${serverUrl}/api/image?url=${encodeURIComponent(rawCover)}`
      : rawCover)
    : '/placeholder-cover.jpg';

  const displayChapters = manga.latestChapters && manga.latestChapters.length > 0
    ? manga.latestChapters
    : (manga.lastChapterId ? [{ title: manga.lastChapter || 'Read Now', id: manga.lastChapterId, time: manga.updateDate || 'Just now' }] : []);

  return (
    <div
      className="recent-added-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        gap: '16px',
        background: 'var(--bg-2)',
        borderRadius: '16px',
        padding: '16px',
        border: `1px solid ${isHovered ? 'var(--accent)' : 'var(--border)'}`,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.3)' : 'none',
        height: '100%',
        position: 'relative'
      }}
    >
      <Link
        href={`/manga/${manga.id}`}
        style={{ flexShrink: 0 }}
        onMouseEnter={() => {
          // 🏎️ Only pre-warm if the user hovers for 150ms (prevents spamming during scroll)
          window.recentTimeout = setTimeout(() => {
            fetch(`${apiBase}/manga/${manga.id}`).catch(() => { });
            fetch(`${apiBase}/chapters/${manga.id}`).catch(() => { });
          }, 150);
        }}
        onMouseLeave={() => clearTimeout(window.recentTimeout)}
      >
        <div style={{
          width: '100px',
          height: '140px',
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
        <Link href={`/manga/${manga.id}`}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '10px',
            color: 'var(--accent)', // Purple accent color
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          {displayChapters.map((ch, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <Link 
                href={`/read/${ch.id}?mangaId=${manga.id}`} 
                style={{ 
                  color: 'var(--text-2)', 
                  textDecoration: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
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
              <span style={{ color: 'var(--text-3)', fontSize: '0.78rem', fontStyle: 'normal', whiteSpace: 'nowrap' }}>
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