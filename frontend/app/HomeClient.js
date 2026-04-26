'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../lib/auth';
import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';
import { mangaApi } from '../lib/api';
import RecentlyAddedCard from '../components/RecentlyAddedCard';

function SkeletonCarousel({ count = 12 }) {
  return (
    <div className="manga-carousel">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-text w-3/4" style={{ marginTop: 8 }} />
          <div className="skeleton skeleton-text w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function HomeClient() {
  const { user, loading: authLoading } = useAuth() || {};
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularUpdates, setPopularUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [recentPage, setRecentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('page'));
    if (p && p > 0) setRecentPage(p);
  }, []);

  // 🛡️ Content Shield: Filters out NSFW/Restricted tags from the Home Page
  const filterManga = (mangaList) => {
    const BLACKLIST = ['18+', 'Adult', 'Smut', 'Erotica', 'Sexual violence', 'Harem', 'Yaoi', 'Yuri'];
    return mangaList.filter(m => {
      const genres = m.genres || [];
      const tagNames = genres.map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
      return !tagNames.some(tag => BLACKLIST.map(b => b.toLowerCase()).includes(tag)) && !m.nsfw;
    });
  };

  useEffect(() => {
    setUpdatesLoading(true);
    mangaApi.popular(1)
      .then((r) => {
        const data = r?.data || r || {};
        const results = Array.isArray(data) ? data : (data.results || []);
        // Apply Shield
        setPopularUpdates(filterManga(results).slice(0, 20));
      })
      .catch((err) => {
        console.error('Popular Manga fetch error:', err);
        setError('Failed to load Popular Manga section');
      })
      .finally(() => setUpdatesLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    mangaApi.recent(recentPage)
      .then((r) => {
        const results = r?.data?.results || r?.results || r || [];
        // Apply Shield
        setRecent(filterManga(Array.isArray(results) ? results : []).slice(0, 30));
        setTotalPages(r?.data?.totalPages || 500);
      })
      .catch((err) => {
        console.error('Recent fetch error:', err);
        setError('Failed to load Recently Added section');
      })
      .finally(() => setLoading(false));
  }, [recentPage]);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    window.location.href = `/?page=${p}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, recentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <AuthProvider>
      <div className="page-wrapper home-page-wrapper" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />

        {process.env.NODE_ENV === 'development' && (
          <div style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 9999, background: 'rgba(0,0,0,0.8)', padding: '10px', fontSize: '10px', borderRadius: '5px', border: '1px solid var(--accent)' }}>
            Popular: {popularUpdates.length} | Recent: {recent.length} | Page: {recentPage} | Loading: {loading ? 'Y' : 'N'}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
          </div>
        )}

        <section className="hero hide-on-mobile" style={{ position: 'relative' }}>
          <div className="hero-grid-lines" />
          <div style={{ position: 'relative', zIndex: 2, paddingTop: '160px', paddingBottom: '80px', maxWidth: '100%', paddingLeft: 'max(24px, 6vw)', paddingRight: '8vw' }}>
            <div style={{ maxWidth: '800px' }}>
              <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900, color: '#fff', marginBottom: '24px', lineHeight: 1.1, fontFamily: '"Inter", sans-serif' }}>
                The Future of <span style={{ color: 'var(--accent)' }}>Manga</span> Reading
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-2)', marginBottom: '40px', maxWidth: '600px', fontFamily: '"Inter", sans-serif' }}>
                A premium, high-performance sanctuary built for speed, aesthetics, and the ultimate reading experience.
              </p>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="/browse" className="start-reading-btn" style={{ position: 'relative', top: '-20px', left: '-10px', display: 'inline-block', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-20px) translateX(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(-20px) translateX(-10px)'}>
                  <img src="/start_reading.png" alt="Start Reading" style={{ width: '320px', height: 'auto' }} />
                </a>
              </div>
            </div>
          </div>

          <div
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              cursor: 'pointer', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
              color: 'var(--text-3)', animation: 'bounce 2s infinite', opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Scroll</span>
            <span className="material-icons" style={{ fontSize: '2rem' }}>keyboard_arrow_down</span>
          </div>
        </section>

        <section id="rated" className="section hide-on-mobile">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">🔥 <span>Popular</span> Manga</h2>
              <a href="/browse?order=2" className="btn btn-ghost btn-sm">View All →</a>
            </div>

            {updatesLoading ? <SkeletonCarousel count={12} /> : (
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
                {popularUpdates.length > 0 ? popularUpdates.map((m) => (
                  <div key={m.id} style={{ minWidth: '200px', scrollSnapAlign: 'start' }}>
                    <MangaCard manga={m} />
                  </div>
                )) : (
                  <div style={{ padding: '40px', textAlign: 'center', width: '100%', color: 'var(--text-3)' }}>
                    No popular manga found at the moment.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="section" style={{ background: 'var(--surface)', margin: '40px 0' }}>
          <div className="container">
            <div className="section-header" style={{ marginBottom: '32px' }}>
              <h2 className="section-title">✨ <span>Recently</span> Added</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  disabled={recentPage <= 1 || loading}
                  onClick={() => window.location.href = `/?page=${recentPage - 1}`}
                  className="btn btn-ghost btn-sm"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Page {recentPage}</span>
                <button
                  disabled={loading}
                  onClick={() => window.location.href = `/?page=${recentPage + 1}`}
                  className="btn btn-ghost btn-sm"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} style={{ height: '160px', background: 'var(--bg-2)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {recent.length > 0 ? recent.map((m) => (
                    <RecentlyAddedCard key={m.id} manga={m} />
                  )) : (
                    <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-3)' }}>
                      No recently added manga found on this page.
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {recentPage > 3 && (
                      <>
                        <button onClick={() => handlePageChange(1)} className="btn-page">1</button>
                        {recentPage > 4 && <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>...</span>}
                      </>
                    )}

                    <button onClick={() => handlePageChange(recentPage - 1)} disabled={recentPage === 1} className="btn-page" style={{ opacity: recentPage === 1 ? 0.3 : 1 }}>
                      <span className="material-icons" style={{ fontSize: '1.2rem' }}>chevron_left</span>
                    </button>

                    {getPageNumbers().map(p => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`btn-page ${p === recentPage ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}

                    <button onClick={() => handlePageChange(recentPage + 1)} disabled={recentPage === totalPages} className="btn-page" style={{ opacity: recentPage === totalPages ? 0.3 : 1 }}>
                      <span className="material-icons" style={{ fontSize: '1.2rem' }}>chevron_right</span>
                    </button>

                    {totalPages > 1 && !getPageNumbers().includes(totalPages) && (
                      <>
                        {recentPage < totalPages - 3 && <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>...</span>}
                        <button onClick={() => handlePageChange(totalPages)} className="btn-page">{totalPages.toLocaleString()}</button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="section" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
          <div className="container">
            <div className="section-header" style={{ marginBottom: '32px' }}>
              <h2 className="section-title">🎭 <span>Explore</span> Genres</h2>
            </div>
            <div className="genres-list-container">
              {[
                { label: '4 koma', slug: '4-koma' }, { label: 'Action', slug: 'action' }, { label: 'Adult', slug: 'adult' },
                { label: 'Adventure', slug: 'adventure' }, { label: 'Artbook', slug: 'artbook' }, { label: 'Award winning', slug: 'award-winning' },
                { label: 'Comedy', slug: 'comedy' }, { label: 'Cooking', slug: 'cooking' }, { label: 'Doujinshi', slug: 'doujinshi' },
                { label: 'Drama', slug: 'drama' }, { label: 'Ecchi', slug: 'ecchi' }, { label: 'Erotica', slug: 'erotica' },
                { label: 'Fantasy', slug: 'fantasy' }, { label: 'Gender Bender', slug: 'gender-bender' }, { label: 'Gore', slug: 'gore' },
                { label: 'Harem', slug: 'harem' }, { label: 'Historical', slug: 'historical' }, { label: 'Horror', slug: 'horror' },
                { label: 'Isekai', slug: 'isekai' }, { label: 'Josei', slug: 'josei' }, { label: 'Loli', slug: 'loli' },
                { label: 'Manhua', slug: 'manhua' }, { label: 'Manhwa', slug: 'manhwa' }, { label: 'Martial Arts', slug: 'martial-arts' },
                { label: 'Mecha', slug: 'mecha' }, { label: 'Medical', slug: 'medical' }, { label: 'Music', slug: 'music' },
                { label: 'Mystery', slug: 'mystery' }, { label: 'One shot', slug: 'one-shot' }, { label: 'Overpowered MC', slug: 'overpowered-mc' },
                { label: 'Psychological', slug: 'psychological' }, { label: 'Reincarnation', slug: 'reincarnation' }, { label: 'Romance', slug: 'romance' },
                { label: 'School Life', slug: 'school-life' }, { label: 'Sci-fi', slug: 'sci-fi' }, { label: 'Seinen', slug: 'seinen' },
                { label: 'Sexual violence', slug: 'sexual-violence' }, { label: 'Shota', slug: 'shota' }, { label: 'Shoujo', slug: 'shoujo' },
                { label: 'Shoujo Ai', slug: 'shoujo-ai' }, { label: 'Shounen', slug: 'shounen' }, { label: 'Shounen Ai', slug: 'shounen-ai' },
                { label: 'Slice of Life', slug: 'slice-of-life' }, { label: 'Sports', slug: 'sports' }, { label: 'Super power', slug: 'super-power' },
                { label: 'Supernatural', slug: 'supernatural' }, { label: 'Survival', slug: 'survival' }, { label: 'Time Travel', slug: 'time-travel' },
                { label: 'Tragedy', slug: 'tragedy' }, { label: 'Webtoon', slug: 'webtoon' }, { label: 'Yaoi', slug: 'yaoi' }, { label: 'Yuri', slug: 'yuri' },
              ].map((g) => (
                <a key={g.slug} href={`/browse?include=${g.slug}`} className="genre-simple-link">
                  {g.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ textAlign: 'center', padding: '0', color: 'var(--text-3)', fontSize: '0.85rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 12, fontWeight: 700, color: 'var(--text-2)', marginTop: '20px' }}>💜 Mani Reader</div>
          <div style={{ paddingBottom: '40px' }}>© 2026 Mani Reader. All Rights Reserved.</div>
        </footer>

        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
            40% { transform: translateY(-10px) translateX(-50%); }
            60% { transform: translateY(-5px) translateX(-50%); }
          }
          @media (max-width: 768px) {
            .hide-on-mobile { display: none !important; }
          }
          .genres-list-container {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px 16px;
          }
          @media (max-width: 1024px) {
            .genres-list-container { grid-template-columns: repeat(5, 1fr); }
          }
          @media (max-width: 768px) {
            .genres-list-container { grid-template-columns: repeat(3, 1fr); }
          }
          .genre-simple-link {
            padding: 4px 8px;
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-2);
            text-decoration: none;
            transition: all 0.2s;
          }
          .genre-simple-link:hover {
            color: var(--accent);
            transform: translateX(4px);
          }
          .btn-page {
            min-width: 44px;
            height: 44px;
            border-radius: 12px;
            font-weight: 700;
            background: var(--surface-2);
            color: var(--text-2);
            border: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .btn-page:hover:not(:disabled) {
            border-color: var(--accent);
            color: var(--accent);
            background: rgba(108, 99, 255, 0.05);
          }
          .btn-page.active {
            background: var(--accent);
            color: #fff;
            border-color: var(--accent);
            box-shadow: 0 4px 15px var(--accent-glow);
          }
          .btn-page:disabled {
            cursor: default;
            opacity: 0.3;
          }
        `}</style>
      </div>
    </AuthProvider>
  );
}
