'use client';
import React from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { bookmarkApi } from '../../lib/api';
import { useRouter } from 'next/navigation';

import LoginRequiredModal from '../../components/LoginRequiredModal';

function LibraryContent() {
  const { user, loading: authLoading } = useAuth() || {};
  const router = useRouter();

  const [bookmarks, setBookmarks] = React.useState([]);
  const [loading,   setLoading]   = React.useState(true);
  const [toast,     setToast]     = React.useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    bookmarkApi.list()
      .then((r) => setBookmarks(r.data || []))
      .catch(() => showToast('Failed to load library', 'error'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function removeBookmark(mangaId) {
    try {
      await bookmarkApi.delete(mangaId);
      setBookmarks((prev) => prev.filter((b) => b.mangaId !== mangaId));
      showToast('Removed from library');
    } catch { showToast('Failed', 'error'); }
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      {!user && !authLoading && (
        <LoginRequiredModal 
          pageName="Bookmarks" 
          onCancel={() => router.push('/')} 
        />
      )}

      <div className="container section">
        <div className="section-header" style={{ marginBottom: 32 }}>
          <div>
            <h1 className="section-title">🔖 My <span>Bookmarks</span></h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: 6 }}>
              Bookmarked chapters — pick up right where you left off.
            </p>
          </div>
          {user && (
            <Link href="/collections" className="btn btn-ghost btn-sm">
              📁 My Collections →
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔖</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-2)' }}>
              Your bookmarks are empty
            </h2>
            <p style={{ marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
              Bookmark chapters while reading to save your progress here.
            </p>
            <Link href="/browse" className="btn btn-primary">Browse Manga →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookmarks.map((bm) => {
              const getApiServerUrl = () => {
                const rawUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!rawUrl) {
                  if (typeof window !== 'undefined' && window.location.hostname.includes('manireader.online')) {
                    return 'https://api.manireader.online';
                  }
                  return '';
                }
                const cleanedUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
                return cleanedUrl.endsWith('/api') ? cleanedUrl.slice(0, -4) : cleanedUrl;
              };

              const coverUrl = bm.manga?.cover
                ? `${getApiServerUrl()}/api/image?url=${encodeURIComponent(bm.manga.cover)}`
                : '/placeholder-cover.jpg';
              const readUrl = `/read/${bm.chapterId}?mangaId=${bm.mangaId}&page=${bm.page || 0}`;

              return (
                <div key={bm.mangaId} style={{
                  display: 'grid', gridTemplateColumns: '72px 1fr auto',
                  gap: 16, alignItems: 'center',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 18px',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  {/* Cover */}
                  <Link href={`/manga/${bm.mangaId}`}>
                    <img
                      src={coverUrl}
                      alt={bm.manga?.title}
                      style={{ width: 72, height: 96, objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }}
                    />
                  </Link>

                  {/* Info */}
                  <div>
                    <Link href={`/manga/${bm.mangaId}`} style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                      {bm.manga?.title || bm.mangaId}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                        background: 'rgba(108,99,255,0.15)', color: 'var(--accent)',
                        border: '1px solid rgba(108,99,255,0.25)',
                      }}>
                        🔖 {bm.chapterId?.split('/').pop() || 'Chapter'}
                      </span>
                      {bm.page > 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                          Page {bm.page + 1}
                        </span>
                      )}
                      {bm.manga?.status && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                          background: bm.manga.status === 'Ongoing' ? 'rgba(34,211,160,0.1)' : 'rgba(180,180,200,0.1)',
                          color: bm.manga.status === 'Ongoing' ? 'var(--green)' : 'var(--text-3)',
                          border: `1px solid ${bm.manga.status === 'Ongoing' ? 'rgba(34,211,160,0.3)' : 'var(--border)'}`,
                        }}>
                          {bm.manga.status}
                        </span>
                      )}
                    </div>
                    {bm.updatedAt && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 6 }}>
                        Saved {new Date(bm.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <Link
                      href={readUrl}
                      className="btn btn-primary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      ▶ Continue
                    </Link>
                    <button
                      onClick={() => removeBookmark(bm.mangaId)}
                      style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                        background: 'rgba(255,77,109,0.1)', color: 'var(--red)',
                        border: '1px solid rgba(255,77,109,0.25)', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default function LibraryPage() {
  return <AuthProvider><LibraryContent /></AuthProvider>;
}
