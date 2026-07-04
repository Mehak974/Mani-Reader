'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getApiServerUrl } from '../lib/api';

export default function RecentlyAddedCard({ manga }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  if (!manga) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';

  const rawCover = manga.image || manga.cover;
  // 🏎️ Smart Proxy: Use relative /api/image path — works on any hostname in production
  const safeDomains = ['image.tmdb.org', 'imgur.com', 'blogspot.com', 'googleusercontent.com', 'placehold.co', 'wp.com', 'cloudinary.com', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com'];
  const coverUrl = rawCover
    ? (rawCover.startsWith('http') && !rawCover.includes('/api/image') && !rawCover.includes('workers.dev') && !safeDomains.some(d => rawCover.includes(d))
      ? `/api/image?url=${encodeURIComponent(rawCover)}`
      : rawCover)
    : '/placeholder-cover.jpg';

  const description = manga.description || 'No description available.';
  const isLong = description.length > 180;
  const truncated = isLong ? description.slice(0, 180) + '...' : description;

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Link href={`/manga/${manga.id}`}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {manga.title}
          </h3>
        </Link>

        <div
          suppressHydrationWarning
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-2)',
            lineHeight: '1.5',
            marginBottom: '12px',
            position: 'relative'
          }}>
          {isExpanded ? description : truncated}
          {isLong && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: '6px',
                padding: 0
              }}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
            <span className="material-icons" style={{ fontSize: '1rem' }}>auto_stories</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {manga.lastChapterId ? (
                <Link
                  href={`/read/${manga.lastChapterId}?mangaId=${manga.id}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {manga.lastChapter || 'Read Now'}
                </Link>
              ) : (
                manga.lastChapter || 'No chapters yet'
              )}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '0.8rem' }}>
            <span className="material-icons" style={{ fontSize: '1rem' }}>schedule</span>
            {manga.updateDate || 'Just now'}
          </div>
        </div>
      </div>
    </div>
  );
}