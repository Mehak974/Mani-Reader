'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../lib/auth';

import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';
import { mangaApi, getApiServerUrl } from '../lib/api';
import RecentlyAddedCard from '../components/RecentlyAddedCard';
import AdBanner from '../components/AdBanner';
import EffectiveCpmAd from '../components/EffectiveCpmAd';
import MangaLoader from '../components/MangaLoader';

function SkeletonCarousel() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px', width: '100%' }}>
      <MangaLoader size="medium" />
    </div>
  );
}

export default function HomeClient({ initialData = {} }) {
  const { user, loading: authLoading, revealNsfw, setRevealNsfw } = useAuth() || {};
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const [recent, setRecent] = React.useState(initialData.recent || []);
  const [loading, setLoading] = React.useState(!initialData.recent);
  
  // Popular Completed section state (from DB)
  const [popularCompleted, setPopularCompleted] = React.useState(initialData.completed || []);
  const [popularLoading, setPopularLoading] = React.useState(!initialData.completed || initialData.completed.length === 0);

  const carouselRef = React.useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector('.popular-card');
      const gapVal = parseFloat(window.getComputedStyle(carouselRef.current).gap || '20');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gapVal : 200;
      carouselRef.current.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector('.popular-card');
      const gapVal = parseFloat(window.getComputedStyle(carouselRef.current).gap || '20');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gapVal : 200;
      carouselRef.current.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
    }
  };

  const [recentPage, setRecentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(initialData.recentTotalPages || 1);
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

  // Fetch popular completed from DB table
  React.useEffect(() => {
    if (popularCompleted.length > 0) {
      setPopularLoading(false);
      return;
    }
    setPopularLoading(true);
    const serverUrl = getApiServerUrl();
    fetch(`${serverUrl}/api/manga/browse/popular-completed`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data.filter(m => !m.nsfw) : [];
        setPopularCompleted(list);
      })
      .catch(() => {})
      .finally(() => setPopularLoading(false));
  }, []);

  React.useEffect(() => {
    // If it's page 1 and we have initial recent updates, skip initial fetch
    if (recentPage === 1 && initialData.recent?.length > 0) {
      setRecent(initialData.recent);
      setLoading(false);
      return;
    }

    setLoading(true);
    mangaApi.recent(recentPage, { params: { _t: Date.now() } })
      .then((r) => {
        const raw = r?.data?.results || r?.results || (Array.isArray(r) ? r : []);
        const results = raw.filter(m => !m.nsfw);
        setRecent(results.slice(0, 30));
        setTotalPages(r?.data?.totalPages || 500);
      })
      .catch((err) => {
        // Suppress console error
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
      <Navbar />

      <div className="container" style={{ marginTop: '75px' }}>
        <AdBanner size="small" />
      </div>

          <section className="section" style={{ paddingTop: '20px', paddingBottom: '12px' }}>
            <div className="container">
              {/* Popular Completed Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>🏆 <span>Popular</span> Completed</h2>
                <a href="/browse?status=completed&order=5" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  View All →
                </a>
              </div>

              <div className="popular-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {popularLoading ? (
                  <SkeletonCarousel count={6} />
                ) : (
                  popularCompleted && popularCompleted.length > 0 ? (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <style>{`
                        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
                        @keyframes card-fade-in {
                          from { opacity: 0; transform: translateY(20px) scale(0.97); }
                          to   { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        .stagger-card { opacity: 0; animation: card-fade-in 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
                        .popular-carousel { gap: 20px; }
                        .popular-card { flex: 0 0 180px; }
                        .popular-container { min-height: 380px; }
                        .popular-card .manga-card-title { font-size: 0.85rem !important; }
                        .popular-card .manga-card-body { padding: 12px 10px 32px 10px !important; }
                        @media (max-width: 768px) {
                          .popular-carousel { gap: 12px; }
                          .popular-card { flex: 0 0 130px; }
                          .popular-container { min-height: 290px; }
                          .popular-card .manga-card-body { min-height: 55px !important; padding: 8px 6px 26px 6px !important; }
                          .popular-card .manga-card-title { font-size: 0.72rem !important; }
                        }
                        .popular-native-ad {
                          flex: 0 0 140px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 220px;
                        }
                        @media (max-width: 768px) {
                          .popular-native-ad { flex: 0 0 100px; min-height: 180px; }
                        }
                      `}</style>

                      {/* Left Arrow */}
                      <button
                        onClick={scrollLeft}
                        className="carousel-arrow left"
                        style={{ position: 'absolute', left: '-20px', zIndex: 10, background: 'rgba(20,20,20,0.85)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-1)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s ease', backdropFilter: 'blur(4px)', outline: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.85)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                      >
                        <span className="material-icons" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>chevron_left</span>
                      </button>

                      {/* Scrollable Carousel with native ads every 5 cards */}
                      <div
                        ref={carouselRef}
                        className="hide-scrollbar popular-carousel"
                        style={{ display: 'flex', overflowX: 'auto', paddingBottom: '10px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', width: '100%', scrollBehavior: 'smooth' }}
                      >
                        {popularCompleted.map((m, index) => {
                          const elements = [];
                          if (index === 3) {
                            elements.push(
                              <div key="inline-native-ad" className="stagger-card popular-card" style={{ scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)', height: '100%', minHeight: '240px', padding: '10px' }}>
                                <EffectiveCpmAd />
                              </div>
                            );
                          }
                          elements.push(
                            <div
                              key={`${m.id}-${index}`}
                              className="stagger-card popular-card"
                              style={{ scrollSnapAlign: 'start', animationDelay: `${(index % 15) * 60}ms` }}
                            >
                              <MangaCard manga={m} revealNsfw={revealNsfw} setRevealNsfw={setRevealNsfw} priority={index < 4} />
                            </div>
                          );
                          return elements;
                        })}
                      </div>

                      {/* Right Arrow */}
                      <button
                        onClick={scrollRight}
                        className="carousel-arrow right"
                        style={{ position: 'absolute', right: '-20px', zIndex: 10, background: 'rgba(20,20,20,0.85)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-1)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s ease', backdropFilter: 'blur(4px)', outline: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.85)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                      >
                        <span className="material-icons" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>chevron_right</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '60px 40px', textAlign: 'center', width: '100%', color: 'var(--text-3)', background: 'var(--bg-2)', borderRadius: '16px' }}>
                      No popular manga found at the moment.
                    </div>
                  )
                )}
              </div>
            </div>
          </section>


          <section id="recent-updates" className="section" style={{ background: 'var(--surface)', margin: '20px 0', paddingTop: '24px', paddingBottom: '24px' }}>
            <div className="container">
              <div className="section-header" style={{ marginBottom: '32px' }} suppressHydrationWarning>
                <h2 className="section-title">✨ <span>Recently</span> Added</h2>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', minHeight: '580px' }}>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} style={{ height: '174px', background: 'var(--bg-2)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {recent.length > 0 ? recent.map((m, index) => {
                      const items = [];
                      if (index === 4) {
                        items.push(
                          <div key="grid-native-ad" className="recent-added-card stagger-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)', minHeight: '120px' }}>
                            <EffectiveCpmAd />
                          </div>
                        );
                      }
                      items.push(
                        <div 
                          key={m.id} 
                          className="stagger-card" 
                          style={{ animationDelay: `${(index % 12) * 50}ms` }}
                        >
                          <RecentlyAddedCard manga={m} />
                        </div>
                      );
                      return items;
                    }) : (
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


                    </div>
                  )}
                </>
              )}
            </div>
          </section>



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

          {/* Bottom Native Ad Zone — 1 slot */}
          <div style={{ background: 'var(--surface)', padding: '20px 0', marginTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <EffectiveCpmAd />
            </div>
          </div>

    </div>
  );
}
