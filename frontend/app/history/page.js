'use client';
import React from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { historyApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
import LoginRequiredModal from '../../components/LoginRequiredModal';

function HistoryContent() {
  const { user, loading: authLoading } = useAuth() || {};
  const router = useRouter();
  const [history, setHistory]   = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [toast,   setToast]     = React.useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    historyApi.list(0, 100)
      .then((r) => setHistory(r.data || []))
      .catch(() => showToast('Failed to load history', 'error'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function clearAll() {
    if (!confirm('Clear all reading history?')) return;
    try {
      await historyApi.clear();
      setHistory([]);
      showToast('History cleared');
    } catch { showToast('Failed', 'error'); }
  }

  function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      
      {!user && !authLoading && (
        <LoginRequiredModal 
          pageName="History" 
          onCancel={() => router.push('/')} 
        />
      )}

      <div className="container section">
        <div className="section-header">
          <h1 className="section-title">🕒 Reading <span>History</span></h1>
          {history.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={clearAll}>Clear All</button>
          )}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)' }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📖</div>
            <p>No reading history yet.</p>
            <Link href="/browse" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>
              Browse Manga →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history
              .filter((h, index, self) => index === self.findIndex((t) => t.mangaId === h.mangaId))
              .map((h) => {
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

              const cover = h.manga?.cover
                ? `${getApiServerUrl()}/api/image?url=${encodeURIComponent(h.manga.cover)}`
                : '/placeholder-cover.jpg';
              return (
                <Link
                  key={h.id}
                  href={`/read/${h.chapterId}?mangaId=${h.mangaId}`}
                  className="history-item"
                >
                  <img className="history-thumb" src={cover} alt="" onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }} />
                  <div>
                    <div className="history-title">{h.manga?.title || 'Unknown'}</div>
                    <div className="history-sub">
                      Chapter {h.chapter?.number}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {timeAgo(h.timestamp)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default function HistoryPage() {
  return <AuthProvider><HistoryContent /></AuthProvider>;
}
