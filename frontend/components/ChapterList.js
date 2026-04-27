'use client';
import { useState } from 'react';
import Link from 'next/link';
import { bookmarkApi, progressApi } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function ChapterList({ chapters = [], mangaId, progress = [] }) {
  const { user } = useAuth() || {};
  const [filter, setFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const readSet = new Set(progress.filter((p) => p.isRead).map((p) => p.chapterId));


  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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
      console.error('Bookmark error:', err);
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
      {/* Controls Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
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
            <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
                  <span className="chapter-num" style={{ color: isRead ? 'inherit' : 'var(--accent)', fontWeight: 700, fontSize: '1rem' }}>Ch. {ch.number}</span>
                  {ch.releasedAt && <span style={{ fontSize: '0.65rem', opacity: 0.5, letterSpacing: '0.02em' }}>{ch.releasedAt}</span>}
                </div>
                <span className="chapter-title" style={{ 
                  flex: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  opacity: isRead ? 0.6 : 1, 
                  paddingRight: 12,
                  minWidth: 0 // Crucial for ellipsis in flexbox
                }}>
                  {ch.title || `Chapter ${ch.number}`}
                </span>
                <span className="chapter-sources" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 500 }}>
                    {ch.sources?.[0] || 'Source'}
                  </span>
                  
                  {/* Read/Unread Toggle */}
                  <button
                    onClick={(e) => handleToggleRead(e, ch.id, isRead)}
                    style={{ background: 'none', color: isRead ? 'var(--green)' : 'var(--text-3)', padding: 4, display: 'flex', borderRadius: '50%', transition: 'var(--transition)' }}
                    title={isRead ? 'Mark as Unread' : 'Mark as Read'}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span className="material-icons" style={{ fontSize: '1.4rem' }}>
                      {isRead ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>

                  {/* Bookmark Icon */}
                  <button 
                    onClick={(e) => handleBookmark(e, ch.id)}
                    style={{ 
                      background: 'none', padding: 4, borderRadius: 6,
                      color: 'var(--text-3)', transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    title="Bookmark Chapter"
                  >
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>bookmark_border</span>
                  </button>
                </span>
              </Link>
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
