'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AuthProvider, useAuth } from '../lib/auth';

import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';
import { mangaApi } from '../lib/api';
import RecentlyAddedCard from '../components/RecentlyAddedCard';
import AdBanner from '../components/AdBanner';

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

// 🛡️ Module-level Content Shield — filters NSFW before setting state
const _BLACKLIST = [
  '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence',
  'harem', 'yaoi', 'yuri', 'incest', 'gore', 'mature', 'ecchi',
  'hentai', 'pornographic', 'loli', 'shota'
];
const _BAD_WORDS = ['sexy', 'sex', 'thot', 'nude', 'porn', 'hentai', 'uncensored', 'sexual', 'unfiltered', 'erotic', 'smut', 'harem'];

function filterManga(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.filter(m => {
    if (m.nsfw) return false;
    const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
    const desc = (m.description || '').toLowerCase();
    const title = (m.title || '').toLowerCase();
    
    const hasBlacklistedTag = genres.some(tag =>
      _BLACKLIST.some(bad => tag === bad || tag.includes(bad) || bad.includes(tag))
    );
    const hasBadWord = _BAD_WORDS.some(word => desc.includes(word) || title.includes(word));
    
    return !hasBlacklistedTag && !hasBadWord;
  });
}

export default function HomeClient() {
  const { user, loading: authLoading } = useAuth() || {};
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const [recent, setRecent] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [popularUpdates, setPopularUpdates] = React.useState([]);
  const [popularAction, setPopularAction] = React.useState([]);
  const [popularAdventure, setPopularAdventure] = React.useState([]);
  const [popularRomance, setPopularRomance] = React.useState([]);
  const [updatesLoading, setUpdatesLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(true);
  const [adventureLoading, setAdventureLoading] = React.useState(true);
  const [romanceLoading, setRomanceLoading] = React.useState(true);
  const [recentPage, setRecentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [error, setError] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const p = parseInt(searchParams?.get('page'));
    if (p && p > 0) {
      setRecentPage(p);
      // Auto-scroll to recent updates if it's not the initial landing
      if (mounted) {
        const el = document.getElementById('recent-updates');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setRecentPage(1);
    }
  }, [searchParams, mounted]);

  React.useEffect(() => {
    // 🖱️ Auto-Scroll Logic: Scroll to content after 4s if still at top (Disabled on Mobile)
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.scrollY < 50 && window.innerWidth > 768) {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    }, 4000);

    // 1. Parallel Fetching
    setUpdatesLoading(true);
    setActionLoading(true);
    setRomanceLoading(true);

    Promise.all([
      mangaApi.popular(1, 'fantasy', { params: { _t: Date.now() } }),
      mangaApi.popular(1, 'action', { params: { _t: Date.now() } }),
      mangaApi.popular(2, 'action', { params: { _t: Date.now() } }),
      mangaApi.popular(1, 'romance', { params: { _t: Date.now() } }),
      mangaApi.popular(2, 'romance', { params: { _t: Date.now() } })
    ]).then(([fantasyRes, action1, action2, romance1, romance2]) => {
      const processGenre = (responses, limit) => {
        const resArray = Array.isArray(responses) ? responses : [responses];
        const seen = new Set();
        const results = [];
        for (const res of resArray) {
          const raw = res?.data?.results || res?.data || res?.results || (Array.isArray(res) ? res : []);
          for (const m of filterManga(raw)) {
            if (!seen.has(m.id)) {
              seen.add(m.id);
              results.push(m);
              if (results.length >= limit) break;
            }
          }
          if (results.length >= limit) break;
        }
        return results;
      };

      setPopularUpdates(processGenre(fantasyRes, 20));
      setPopularAction(processGenre([action1, action2], 18));
      setPopularRomance(processGenre([romance1, romance2], 18));
    })
    .catch(err => {
      console.error('Home sections fetch error:', err);
      setError('Some sections failed to load');
    })
    .finally(() => {
      setUpdatesLoading(false);
      setActionLoading(false);
      setRomanceLoading(false);
    });

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    setLoading(true);
    mangaApi.recent(recentPage, { params: { _t: Date.now() } })
      .then((r) => {
        const raw = r?.data?.results || r?.results || (Array.isArray(r) ? r : []);
        const results = filterManga(raw);
        setRecent(results.slice(0, 30));
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
    router.push(`/?page=${p}`);
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
    <div className="page-wrapper home-page-wrapper" style={{ background: 'var(--bg)', minHeight: '100vh' }} suppressHydrationWarning>
      {!mounted ? (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container" style={{ paddingTop: '100px' }}>
            <div style={{ marginBottom: 40 }}><SkeletonCarousel count={6} /></div>
            <div style={{ marginBottom: 40 }}><SkeletonCarousel count={6} /></div>
          </div>
        </div>
      ) : (
        <>
          <Navbar />

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
                <Image
                  src="/start_reading.png"
                  alt="Start Reading"
                  width={320}
                  height={100}
                  style={{ width: '320px', height: 'auto' }}
                  priority
                />
              </a>
            </div>
          </div>
        </div>

          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              cursor: 'pointer', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
              color: 'var(--text-3)', animation: 'bounce 2s infinite', opacity: 0.8,
              transition: 'opacity 0.2s', background: 'none', border: 'none'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Scroll</span>
            <span className="material-icons" style={{ fontSize: '2rem' }}>keyboard_arrow_down</span>
          </button>
      </section>

      <div className="container">
        <AdBanner size="small" slot="8394012345" /> {/* Use your real slot ID here */}
      </div>

      <section id="fantasy" className="section">
        <div className="container">
          <div className="section-header" suppressHydrationWarning>
            <h2 className="section-title">✨ Popular <span>Fantasy</span></h2>
            <a href="/browse?include=fantasy&order=5" className="btn btn-ghost btn-sm">View All →</a>
          </div>

          {updatesLoading ? <SkeletonCarousel count={12} /> : (
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
              {popularUpdates.length > 0 ? popularUpdates.map((m, index) => (
                <div key={m.id} style={{ flex: '0 0 180px', scrollSnapAlign: 'start' }}>
                  <MangaCard manga={m} priority={index < 4} />
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

      {/* ⚔️ Action Section — only show if there are results */}
      <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">⚔️ Popular <span>Action</span></h2>
              <a href="/browse?include=action&order=5" className="btn btn-ghost btn-sm">More →</a>
            </div>
            {actionLoading ? <SkeletonCarousel count={6} /> : (
              popularAction.length > 0 ? (
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
                  {popularAction.map((m) => (
                    <div key={m.id} style={{ flex: '0 0 180px', scrollSnapAlign: 'start' }}>
                      <MangaCard manga={m} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', width: '100%', color: 'var(--text-3)' }}>
                  No popular action manga found at the moment.
                </div>
              )
            )}
          </div>
        </section>


        {/* 💖 Romance Section — only show if there are results */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">💖 Popular <span>Romance</span></h2>
              <a href="/browse?include=romance&order=5" className="btn btn-ghost btn-sm">More →</a>
            </div>
            {romanceLoading ? <SkeletonCarousel count={6} /> : (
              popularRomance.length > 0 ? (
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
                  {popularRomance.map((m) => (
                    <div key={m.id} style={{ flex: '0 0 180px', scrollSnapAlign: 'start' }}>
                      <MangaCard manga={m} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', width: '100%', color: 'var(--text-3)' }}>
                  No popular romance manga found at the moment.
                </div>
              )
            )}
          </div>
        </section>
     

      <section id="recent-updates" className="section" style={{ background: 'var(--surface)', margin: '40px 0' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '32px' }} suppressHydrationWarning>
            <h2 className="section-title">✨ <span>Recently</span> Added</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {mounted && (
                <>
                  <button
                    disabled={recentPage <= 1 || loading}
                    onClick={() => handlePageChange(recentPage - 1)}
                    className="btn btn-ghost btn-sm"
                  >
                    <span className="material-icons">chevron_left</span>
                  </button>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Page {recentPage}</span>
                  <button
                    disabled={loading}
                    onClick={() => handlePageChange(recentPage + 1)}
                    className="btn btn-ghost btn-sm"
                  >
                    <span className="material-icons">chevron_right</span>
                  </button>
                </>
              )}
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

              {mounted && totalPages > 1 && (
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
                      <button onClick={() => handlePageChange(totalPages)} className="btn-page">{totalPages}</button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="container">
        <AdBanner size="small" slot="8394012346" /> {/* Use your real slot ID here */}
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '32px' }}>
            <h2 className="section-title">🎭 <span>Explore</span> Genres</h2>
          </div>
          <div className="genres-list-container notranslate">
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
              { label: 'Tragedy', slug: 'tragedy' }, { label: 'Webtoon', slug: 'webtoon' }, { label: 'Yaoi', slug: 'yaoi' }, { label: 'Yuri', slug: 'yuri' }
            ].map((g) => (
              <a key={g.slug} href={`/browse?include=${g.slug}`} className="genre-simple-link">
                {g.label}
              </a>
            ))}
          </div>
        </div>
      </section>


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
            gap: 16px 12px;
          }
          @media (max-width: 1024px) {
            .genres-list-container { grid-template-columns: repeat(5, 1fr); }
          }
          @media (max-width: 600px) {
            .genres-list-container { grid-template-columns: repeat(3, 1fr); }
          }
          .genre-simple-link {
            color: var(--text-2);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: color 0.2s;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .genre-simple-link:hover {
            color: var(--accent);
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
        </>
      )}
    </div>
  );
}
