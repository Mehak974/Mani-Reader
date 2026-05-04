'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { progressApi, bookmarkApi, historyApi } from '../../lib/api';

// ── Vertical Reader ────────────────────────────────────────────────────────────
export function VerticalReader({ pages, chapterId, mangaId, prevChapter, nextChapter, currentChapter }) {
  const [loaded, setLoaded] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true); // 🤫 Immersive Mode
  const containerRef = useRef(null);
  const router = useRouter();

  const progress = pages.length > 0 ? Math.round((currentPage / pages.length) * 100) : 0;
  const chNum = currentChapter?.chapterNumber || currentChapter?.number || '';

  // Track scroll position → update current page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const imgs = el.querySelectorAll('.reader-page');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.index, 10);
            setCurrentPage(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    imgs.forEach((img) => observer.observe(img));
    return () => observer.disconnect();
  }, [pages]);

  // 👻 Ghost Mode: Buffer progress in local memory, sync once at the end
  useEffect(() => {
    if (!chapterId || !mangaId) return;
    try {
      localStorage.setItem(`mv_progress_${mangaId}`, JSON.stringify({ chapterId, page: currentPage }));
    } catch {}

    // If 90% through or on the last page, mark as read
    const isRead = currentPage >= pages.length - 2 || (pages.length > 0 && currentPage === pages.length - 1);
    
    if (isRead) {
      progressApi.set(mangaId, chapterId, currentPage, true).catch(() => {});
      historyApi.add(mangaId, chapterId, currentPage).catch(() => {});
    }

    return () => {
      // Sync last known position when leaving, but only if it's NOT the last page (already synced)
      if (currentPage > 0 && currentPage < pages.length - 1) {
        progressApi.set(mangaId, chapterId, currentPage, false).catch(() => {});
      }
    };
  }, [currentPage, chapterId, mangaId, pages.length]);

  return (
    <div className="reader-wrapper" onClick={(e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      setShowControls(!showControls);
    }}>
      <style jsx>{`
        .reader-wrapper {
          background: #000;
          min-height: 100vh;
          -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
        }
        .reader-topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(15px);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${showControls ? 'translateY(0)' : 'translateY(-100%)'};
          border-bottom: 1px solid var(--border);
        }
        .reader-progress-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 1000;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${showControls ? 'translateY(0)' : 'translateY(100%)'};
        }
        .reader-vertical {
          padding-top: ${showControls ? '70px' : '0'};
          transition: padding 0.4s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          scroll-behavior: smooth;
          will-change: transform; /* Hardware acceleration */
        }
        .reader-page {
          width: 100%;
          max-width: 900px;
          display: flex;
          justify-content: center;
          background: #000;
          contain: layout paint; /* Optimization */
        }
        .reader-page img {
          width: 100%;
          height: auto;
          display: block;
          image-rendering: -webkit-optimize-contrast;
        }
      `}</style>

      {/* Top bar */}
      <div className="reader-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '65px', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/manga/${mangaId}`} className="btn btn-ghost btn-sm">
            <span className="material-icons" style={{ fontSize: '1.2rem', marginRight: 4 }}>arrow_back</span>
            <span className="desktop-only">Back</span>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            <span className="material-icons" style={{ fontSize: '1.2rem' }}>home</span>
            <span className="desktop-only" style={{ marginLeft: 4 }}>Home</span>
          </Link>
        </div>

        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          Chapter {chNum}
        </div>

        <div className="reader-controls" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-3)' }}
            title="Bookmark this page"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await bookmarkApi.set(mangaId, chapterId, currentPage);
                alert('Position bookmarked! 🔖');
              } catch (err) {
                const msg = err.response?.data?.error || err.message;
                if (err.response?.status === 401) {
                  alert('Please login to bookmark chapters');
                } else {
                  alert(`Failed to bookmark: ${msg}`);
                }
              }
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.2rem' }}>bookmark_add</span>
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={(e) => { e.stopPropagation(); prevChapter && router.push(`/read/${prevChapter}?mangaId=${mangaId}`); }}
            disabled={!prevChapter}
          >
            <span className="desktop-only">← Prev</span>
            <span className="mobile-only material-icons">chevron_left</span>
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={(e) => { e.stopPropagation(); nextChapter && router.push(`/read/${nextChapter}?mangaId=${mangaId}`); }}
            disabled={!nextChapter}
          >
            <span className="desktop-only">Next →</span>
            <span className="mobile-only material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Pages */}
      <div ref={containerRef} className="reader-vertical">
        {pages.map((url, i) => (
          <div key={i} className="reader-page" data-index={i}>
            <img
              src={url}
              alt={`Page ${i + 1}`}
              loading={i < 5 ? 'eager' : 'lazy'}
              onLoad={() => setLoaded((prev) => new Set([...prev, i]))}
              style={{ opacity: loaded.has(i) ? 1 : 0, transition: 'opacity 0.6s ease' }}
            />
            {!loaded.has(i) && (
              <div className="skeleton" style={{ width: '100%', height: 800 }} />
            )}
          </div>
        ))}

        {nextChapter && (
          <div style={{ textAlign: 'center', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-3)', marginBottom: 20 }}>Finished Chapter {chNum}</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/read/${nextChapter}?mangaId=${mangaId}`)}
              style={{ padding: '14px 40px', borderRadius: '14px' }}
            >
              Next Chapter →
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="reader-progress-bar" style={{ height: '4px', background: 'var(--surface-2)' }}>
        <div className="reader-progress-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
      </div>
    </div>
  );
}

// ── Paged Reader ───────────────────────────────────────────────────────────────
export function PagedReader({ pages, chapterId, mangaId, prevChapter, nextChapter, currentChapter }) {
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(true); // 🤫 Immersive Mode
  const router = useRouter();

  const progress = pages.length > 0 ? Math.round(((current + 1) / pages.length) * 100) : 0;
  const chNum = currentChapter?.chapterNumber || currentChapter?.number || '';

  useEffect(() => {
    if (!chapterId || !mangaId) return;
    try {
      localStorage.setItem(`mv_progress_${mangaId}`, JSON.stringify({ chapterId, page: current }));
    } catch {}

    const isRead = current >= pages.length - 2 || (pages.length > 0 && current === pages.length - 1);
    
    if (isRead) {
      progressApi.set(mangaId, chapterId, current, true).catch(() => {});
      historyApi.add(mangaId, chapterId, current).catch(() => {});
    }

    return () => {
      if (current > 0 && current < pages.length - 1) {
        progressApi.set(mangaId, chapterId, current, false).catch(() => {});
      }
    };
  }, [current, chapterId, mangaId, pages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrent((p) => Math.min(p + 1, pages.length - 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrent((p) => Math.max(p - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pages.length]);

  return (
    <div className="reader-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
      <style jsx>{`
        .reader-topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(15px);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${showControls ? 'translateY(0)' : 'translateY(-100%)'};
          border-bottom: 1px solid var(--border);
        }
        .reader-progress-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 1000;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${showControls ? 'translateY(0)' : 'translateY(100%)'};
        }
      `}</style>

      <div className="reader-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '65px', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/manga/${mangaId}`} className="btn btn-ghost btn-sm">
            <span className="material-icons" style={{ fontSize: '1.2rem', marginRight: 4 }}>arrow_back</span>
            Back
          </Link>
        </div>

        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem' }}>
          Chapter {chNum}
        </div>

        <div className="reader-controls" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-3)' }}
            title="Bookmark this page"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await bookmarkApi.set(mangaId, chapterId, current);
                alert('Position bookmarked! 🔖');
              } catch (err) {
                const msg = err.response?.data?.error || err.message;
                if (err.response?.status === 401) {
                  alert('Please login to bookmark chapters');
                } else {
                  alert(`Failed to bookmark: ${msg}`);
                }
              }
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.2rem' }}>bookmark_add</span>
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={(e) => { e.stopPropagation(); prevChapter && router.push(`/read/${prevChapter}?mangaId=${mangaId}`); }}
            disabled={!prevChapter}
          >
            ← Prev
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={(e) => { e.stopPropagation(); nextChapter && router.push(`/read/${nextChapter}?mangaId=${mangaId}`); }}
            disabled={!nextChapter}
          >
            Next →
          </button>
        </div>
      </div>

      <div
        className="reader-paged"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          
          const midX = window.innerWidth / 2;
          const midY = window.innerHeight / 2;
          
          // 🤫 Immersive Mode Toggle: Clicking the center 30% of the screen toggles controls
          if (e.clientX > midX * 0.7 && e.clientX < midX * 1.3 && e.clientY > midY * 0.7 && e.clientY < midY * 1.3) {
            setShowControls(!showControls);
            return;
          }

          if (e.clientX > midX) setCurrent((p) => Math.min(p + 1, pages.length - 1));
          else setCurrent((p) => Math.max(p - 1, 0));
        }}
      >
        {pages[current] && (
          <img src={pages[current]} alt={`Page ${current + 1}`} style={{ maxHeight: '100vh', objectFit: 'contain' }} />
        )}
      </div>

      <div className="reader-progress-bar" style={{ height: '4px', background: 'var(--surface-2)' }}>
        <div className="reader-progress-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
      </div>
    </div>
  );
}
