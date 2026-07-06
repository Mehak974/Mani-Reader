'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../lib/auth';

import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';
import { mangaApi } from '../lib/api';
import RecentlyAddedCard from '../components/RecentlyAddedCard';
import AdBanner from '../components/AdBanner';
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
  
  // Tabbed popular sections state
  const [activeTab, setActiveTab] = React.useState('action');
  const [popularData, setPopularData] = React.useState({
    action: initialData.action || [],
    fantasy: initialData.fantasy || [],
    romance: initialData.romance || []
  });
  const [tabLoading, setTabLoading] = React.useState({
    action: !initialData.action || initialData.action.length === 0,
    fantasy: !initialData.fantasy || initialData.fantasy.length === 0,
    romance: !initialData.romance || initialData.romance.length === 0
  });

  const carouselRef = React.useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const cardWidth = 200; // 180px flex-basis + 20px gap
      if (currentScroll <= 10) {
        const midPoint = carouselRef.current.scrollWidth / 2;
        carouselRef.current.scrollLeft = midPoint;
      }
      carouselRef.current.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const cardWidth = 200;
      const midPoint = carouselRef.current.scrollWidth / 2;
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      if (currentScroll >= midPoint - 10) {
        carouselRef.current.scrollLeft = currentScroll - midPoint;
      }
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

  // Fetch popular data on active tab change (if not loaded yet)
  React.useEffect(() => {
    if (popularData[activeTab] && popularData[activeTab].length > 0) {
      setTabLoading(prev => ({ ...prev, [activeTab]: false }));
      return;
    }

    setTabLoading(prev => ({ ...prev, [activeTab]: true }));
    mangaApi.popular(1, activeTab, { params: { _t: Date.now() } })
      .then((res) => {
        const raw = res?.data || res || [];
        const results = raw.filter(m => !m.nsfw).slice(0, 15);
        setPopularData(prev => ({ ...prev, [activeTab]: results }));
      })
      .catch(() => {})
      .finally(() => {
        setTabLoading(prev => ({ ...prev, [activeTab]: false }));
      });
  }, [activeTab]);

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

          <div className="container" style={{ marginTop: '90px' }}>
            <AdBanner size="small" slot="8394012345" /> {/* Use your real slot ID here */}
          </div>

          <section className="section" style={{ paddingBottom: '20px' }}>
            <div className="container">
              {/* Premium Tabbed Navigation */}
              <div className="tab-container" style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '28px', 
                borderBottom: '1px solid var(--border)', 
                paddingBottom: '0',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}>
                {[
                  { id: 'action', label: '⚔️ Popular Action', urlSlug: 'action' },
                  { id: 'fantasy', label: '✨ Popular Fantasy', urlSlug: 'fantasy' },
                  { id: 'romance', label: '💖 Popular Romance', urlSlug: 'romance' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-3)',
                      fontWeight: '600',
                      fontSize: '1.15rem',
                      cursor: 'pointer',
                      padding: '12px 20px',
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s ease',
                      outline: 'none'
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '0', 
                        left: '12px', 
                        right: '12px', 
                        height: '3px', 
                        background: 'var(--accent)', 
                        borderRadius: '2px 2px 0 0'
                      }} />
                    )}
                  </button>
                ))}
                
                {/* Dynamically adjust the "View All" link based on active tab */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '12px' }}>
                  <a href={`/browse?include=${activeTab}&order=5`} className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    View All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} →
                  </a>
                </div>
              </div>

              <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {tabLoading[activeTab] ? (
                  <SkeletonCarousel count={6} />
                ) : (
                  popularData[activeTab] && popularData[activeTab].length > 0 ? (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <style>{`
                        .hide-scrollbar::-webkit-scrollbar {
                          display: none !important;
                        }
                        @keyframes card-fade-in {
                          from { opacity: 0; transform: translateY(20px) scale(0.97); }
                          to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        .stagger-card {
                          opacity: 0;
                          animation: card-fade-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                      `}</style>
                      
                      {/* Left Navigation Arrow */}
                      <button 
                        onClick={scrollLeft}
                        className="carousel-arrow left"
                        style={{
                          position: 'absolute',
                          left: '-20px',
                          zIndex: 10,
                          background: 'rgba(20, 20, 20, 0.85)',
                          border: '1px solid var(--border)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-1)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          transition: 'all 0.2s ease',
                          backdropFilter: 'blur(4px)',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 20, 20, 0.85)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                      >
                        <span className="material-icons" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>chevron_left</span>
                      </button>

                      {/* Scrollable Carousel */}
                      <div 
                        ref={carouselRef}
                        className="hide-scrollbar"
                        style={{ 
                          display: 'flex', 
                          gap: '20px', 
                          overflowX: 'auto', 
                          paddingBottom: '10px', 
                          scrollSnapType: 'x mandatory',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          width: '100%',
                          scrollBehavior: 'smooth'
                        }}
                      >
                        {[...popularData[activeTab], ...popularData[activeTab]].map((m, index) => (
                          <div 
                            key={`${m.id}-${index}`} 
                            className="stagger-card"
                            style={{ 
                              flex: '0 0 180px', 
                              scrollSnapAlign: 'start',
                              animationDelay: `${(index % 15) * 60}ms`
                            }}
                          >
                            <MangaCard 
                              manga={m} 
                              revealNsfw={revealNsfw} 
                              setRevealNsfw={setRevealNsfw} 
                              priority={index < 4} 
                            />
                          </div>
                        ))}
                      </div>

                      {/* Right Navigation Arrow */}
                      <button 
                        onClick={scrollRight}
                        className="carousel-arrow right"
                        style={{
                          position: 'absolute',
                          right: '-20px',
                          zIndex: 10,
                          background: 'rgba(20, 20, 20, 0.85)',
                          border: '1px solid var(--border)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-1)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          transition: 'all 0.2s ease',
                          backdropFilter: 'blur(4px)',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 20, 20, 0.85)'; e.currentTarget.style.color = 'var(--text-1)'; }}
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


          <section id="recent-updates" className="section" style={{ background: 'var(--surface)', margin: '40px 0' }}>
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
                    {recent.length > 0 ? recent.map((m, index) => (
                      <div 
                        key={m.id} 
                        className="stagger-card" 
                        style={{ animationDelay: `${(index % 12) * 50}ms` }}
                      >
                        <RecentlyAddedCard manga={m} />
                      </div>
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
    </div>
  );
}
