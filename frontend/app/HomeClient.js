'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../lib/auth';

import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';
import { mangaApi, getApiServerUrl } from '../lib/api';
import RecentlyAddedCard from '../components/RecentlyAddedCard';

// Cache bust: 2026-01-14

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
      if (mounted) {
        const el = document.getElementById('recent-updates');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setRecentPage(1);
    }
  }, [searchParams, mounted]);

  React.useEffect(() => {
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

      <div className="container" style={{ marginTop: '16px', marginBottom: '8px' }}></div>

           <section id="recent-updates" className="section" style={{ background: 'var(--surface)', margin: '16px 0', paddingTop: '20px', paddingBottom: '20px' }}>
             <div className="container">
               <div className="section-header" style={{ marginBottom: '24px' }} suppressHydrationWarning>
                 <h2 className="section-title" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}>✨ <span>Recently</span> Added</h2>
               </div>

               {loading ? (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', minHeight: '500px' }}>
                   {[...Array(6)].map((_, i) => (
                     <div key={i} style={{ height: '160px', background: 'var(--bg-2)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                   ))}
                 </div>
               ) : (
                 <>
                   <div className="recent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                     {recent.length > 0 ? recent.map((m, index) => (
                       <div 
                         key={m.id} 
                         className="stagger-card" 
                         style={{ animationDelay: `${(index % 12) * 50}ms` }}
                       >
                         <RecentlyAddedCard manga={m} />
                       </div>
                     )) : (
                       <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                         No recently added manga found on this page.
                       </div>
                     )}
                   </div>

                   {mounted && totalPages > 1 && (
                     <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                       {recentPage > 3 && (
                         <>
                           <button onClick={() => handlePageChange(1)} className="btn-page">1</button>
                           {recentPage > 4 && <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>...</span>}
                         </>
                       )}

                       <button onClick={() => handlePageChange(recentPage - 1)} disabled={recentPage === 1} className="btn-page" style={{ opacity: recentPage === 1 ? 0.3 : 1 }}>
                         <span className="material-icons" style={{ fontSize: '1.1rem' }}>chevron_left</span>
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
                         <span className="material-icons" style={{ fontSize: '1.1rem' }}>chevron_right</span>
                       </button>
                     </div>
                   )}
                 </>
               )}
             </div>
           </section>



           <section className="section" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
             <div className="container">
               <div className="section-header" style={{ marginBottom: '24px' }}>
                 <h2 className="section-title" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}>🎭 <span>Explore</span> Genres</h2>
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
