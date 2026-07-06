'use client';
import React from 'react';
import Link from 'next/link';
import { bookmarkApi, progressApi } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function ChapterList({ chapters = [], mangaId, progress = [] }) {
  const { user } = useAuth() || {};
  const [filter, setFilter] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const readSet = new Set(progress.filter((p) => p.isRead).map((p) => p.chapterId));


  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleScrollToLastRead = () => {
    const sortedProgress = [...progress].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const lastRead = sortedProgress[0];
    if (lastRead) {
      const el = document.getElementById(`chapter-item-${lastRead.chapterId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '2px solid var(--accent)';
        el.style.outlineOffset = '4px';
        el.style.borderRadius = '14px';
        setTimeout(() => {
          el.style.outline = 'none';
        }, 3000);
      } else {
        showToast('Last read chapter is not in the list', 'error');
      }
    } else {
      showToast('No progress found for this manga', 'info');
    }
  };

  const displayed = filter
    ? chapters.filter((ch) => 
        String(ch.number).includes(filter) || 
        ch.title?.toLowerCase().includes(filter.toLowerCase())
      )
    : chapters;

  const handleBookmark = async (e, chId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return showToast('Login to bookmark', 'error');
    try {
      await bookmarkApi.set(mangaId, chId, 0);
      showToast('Chapter bookmarked ✓');
    } catch (err) {
      // Suppress console error
      showToast('Failed to bookmark', 'error');
    }
  };

  const handleToggleRead = async (e, chId, currentlyRead) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return showToast('Login to update progress', 'error');
    try {
      await progressApi.set(mangaId, chId, 0, !currentlyRead);
      showToast(!currentlyRead ? 'Marked as read' : 'Marked as unread');
      // In a real app we'd refresh the parent's progress state or use a local state
      window.location.reload(); 
    } catch {
      showToast('Failed to update progress', 'error');
    }
  };



  const toggleSelect = (chId) => {
    const next = new Set(selectedIds);
    if (next.has(chId)) next.delete(chId);
    else next.add(chId);
    setSelectedIds(next);
  };

  return (
    <div>
      {/* Controls Header - Sticky */}
      <div style={{
        position: 'sticky',
        top: '0px',
        zIndex: 100,
        background: 'var(--bg)',
        paddingTop: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '20px',
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <input
            type="text"
            className="search-input"
            placeholder="Filter chapters..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Scroll Navigation Buttons */}
        <button 
          className="btn btn-ghost" 
          onClick={handleScrollToLastRead} 
          title="Scroll to last read chapter"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>auto_stories</span>
          <span className="desktop-only" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Last Read</span>
        </button>

        <button 
          className="btn btn-ghost" 
          onClick={handleScrollToBottom} 
          title="Scroll to bottom"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>arrow_downward</span>
          <span className="desktop-only" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bottom</span>
        </button>

        {/* Refresh Button */}
        <button 
          className="btn btn-ghost" 
          onClick={() => window.location.reload()} 
          title="Refresh chapters and metadata"
          style={{ padding: '8px 12px' }}
        >
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>refresh</span>
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>{displayed.length} chapter{displayed.length !== 1 ? 's' : ''}</span>
        {selectionMode && (
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setSelectedIds(new Set(chapters.map(c => c.id)))}>
            Select All
          </span>
        )}
      </div>

      <div className="chapter-list">
        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
            No chapters found.
          </div>
        )}
        {displayed.map((ch) => {
          const isRead = readSet.has(ch.id);
          let bg = 'var(--surface)';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';
          let opacity = 1;

          if (isRead) {
            bg = 'rgba(255,255,255,0.03)';
            textColor = 'var(--text-3)';
          }

          return (
            <div key={ch.id} id={`chapter-item-${ch.id}`} className="chapter-list-item-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {selectionMode && (
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(ch.id)}
                  onChange={() => toggleSelect(ch.id)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              )}
              <Link
                href={`/read/${ch.id}?mangaId=${mangaId}`}
                className={`chapter-item ${isRead ? 'read' : ''}`}
                style={{ 
                  flex: 1,
                  background: bg,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  textDecoration: 'none'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
                  <span className="chapter-num" style={{ color: isRead ? 'inherit' : 'var(--accent)', fontWeight: 700, fontSize: '1rem' }}>Ch. {ch.number}</span>
                  {ch.releasedAt && <span style={{ fontSize: '0.65rem', opacity: 0.5, letterSpacing: '0.02em' }}>{ch.releasedAt}</span>}
                </div>
                <span className={`chapter-title mobile-trim`} style={{ 
                  flex: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  opacity: isRead ? 0.6 : 1, 
                  paddingRight: 12,
                  minWidth: 0
                }}>
                  {ch.title || `Chapter ${ch.number}`}
                </span>
                <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 500 }}>
                  {ch.sources?.[0] || 'Source'}
                </span>
              </Link>

              <div className="chapter-actions" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Read/Unread Toggle */}
                <button
                  onClick={(e) => handleToggleRead(e, ch.id, isRead)}
                  style={{ background: 'none', border: 'none', color: isRead ? 'var(--green)' : 'var(--text-3)', padding: 8, display: 'flex', borderRadius: '50%', transition: 'var(--transition)', cursor: 'pointer' }}
                  title={isRead ? 'Mark as Unread' : 'Mark as Read'}
                >
                  <span className="material-icons" style={{ fontSize: '1.4rem' }}>
                    {isRead ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>

                {/* Bookmark Icon */}
                <button 
                  onClick={(e) => handleBookmark(e, ch.id)}
                  style={{ 
                    background: 'none', border: 'none', padding: 8, borderRadius: 50,
                    color: 'var(--text-3)', transition: 'var(--transition)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                  title="Bookmark Chapter"
                >
                  <span className="material-icons" style={{ fontSize: '1.4rem' }}>bookmark_border</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .btn-dropdown-item {
          display: block; width: 100%; padding: 10px 12px;
          text-align: left; background: none; border: none;
          color: var(--text-2); font-size: 0.85rem; border-radius: 8px;
          transition: var(--transition); cursor: pointer;
        }
        .btn-dropdown-item:hover {
          background: var(--surface-2); color: var(--text);
        }
      `}</style>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
