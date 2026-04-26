'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { progressApi, bookmarkApi, historyApi } from '../../lib/api';

// ── Vertical Reader ────────────────────────────────────────────────────────────
export function VerticalReader({ pages, chapterId, mangaId, prevChapter, nextChapter, currentChapter }) {
  const [loaded, setLoaded] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
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
    if (!chapterId || !mangaId || currentPage === 0) return;
    
    // Save to LocalStorage instantly (0 requests)
    try {
      localStorage.setItem(`mv_progress_${mangaId}`, JSON.stringify({ chapterId, page: currentPage }));
    } catch {}

    const isRead = currentPage === pages.length - 1;
    
    // Only call the server if they actually FINISH the chapter
    if (isRead) {
      progressApi.set(mangaId, chapterId, currentPage, true).catch(() => {});
      historyApi.add(mangaId, chapterId, currentPage).catch(() => {});
    }

    // Optional: Sync to server when they leave the reader
    return () => {
      if (currentPage > 0) {
        progressApi.set(mangaId, chapterId, currentPage, isRead).catch(() => {});
      }
    };
  }, [currentPage, chapterId, mangaId, pages.length]);

  return (
    <div className="reader-wrapper">
      {/* Top bar */}
      <div className="reader-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/manga/${mangaId}`} className="btn btn-ghost btn-sm">
            <span className="material-icons" style={{ fontSize: '1.2rem', marginRight: 4 }}>arrow_back</span>
            Back
          </Link>
        </div>

        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>
          Chapter {chNum}
        </div>

        <div className="reader-controls" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => prevChapter && router.push(`/read/${prevChapter}?mangaId=${mangaId}`)}
            disabled={!prevChapter}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => nextChapter && router.push(`/read/${nextChapter}?mangaId=${mangaId}`)}
            disabled={!nextChapter}
          >
            Next →
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
              loading={i < 3 ? 'eager' : 'lazy'}
              onLoad={() => setLoaded((prev) => new Set([...prev, i]))}
              style={{ opacity: loaded.has(i) ? 1 : 0, transition: 'opacity 0.3s' }}
            />
            {!loaded.has(i) && (
              <div className="skeleton" style={{ height: 600, marginBottom: 2 }} />
            )}
          </div>
        ))}

        {/* Next chapter prompt */}
        {nextChapter && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>End of chapter</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/read/${nextChapter}?mangaId=${mangaId}`)}
            >
              Continue to Next Chapter →
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="reader-progress-bar">
        <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ── Paged Reader ───────────────────────────────────────────────────────────────
export function PagedReader({ pages, chapterId, mangaId, prevChapter, nextChapter, currentChapter }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const progress = pages.length > 0 ? Math.round(((current + 1) / pages.length) * 100) : 0;

  const chNum = currentChapter?.chapterNumber || currentChapter?.number || '';

  // 👻 Ghost Mode: Buffer progress in local memory, sync once at the end
  useEffect(() => {
    if (!chapterId || !mangaId) return;

    // Save to LocalStorage instantly (0 requests)
    try {
      localStorage.setItem(`mv_progress_${mangaId}`, JSON.stringify({ chapterId, page: current }));
    } catch {}

    const isRead = current === pages.length - 1;
    
    // Only call the server if they actually FINISH the chapter
    if (isRead) {
      progressApi.set(mangaId, chapterId, current, true).catch(() => {});
      historyApi.add(mangaId, chapterId, current).catch(() => {});
    }

    // Optional: Sync to server when they leave the reader
    return () => {
      if (current > 0) {
        progressApi.set(mangaId, chapterId, current, isRead).catch(() => {});
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
    <div className="reader-wrapper">
      <div className="reader-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/manga/${mangaId}`} className="btn btn-ghost btn-sm">
            <span className="material-icons" style={{ fontSize: '1.2rem', marginRight: 4 }}>arrow_back</span>
            Back
          </Link>
        </div>

        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>
          Chapter {chNum}
        </div>

        <div className="reader-controls" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => prevChapter && router.push(`/read/${prevChapter}?mangaId=${mangaId}`)}
            disabled={!prevChapter}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => nextChapter && router.push(`/read/${nextChapter}?mangaId=${mangaId}`)}
            disabled={!nextChapter}
          >
            Next →
          </button>
        </div>
      </div>

      <div
        className="reader-paged"
        onClick={(e) => {
          const midX = window.innerWidth / 2;
          if (e.clientX > midX) setCurrent((p) => Math.min(p + 1, pages.length - 1));
          else setCurrent((p) => Math.max(p - 1, 0));
        }}
      >
        {pages[current] && (
          <img src={pages[current]} alt={`Page ${current + 1}`} />
        )}
      </div>

      <div className="reader-progress-bar">
        <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
