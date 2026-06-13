'use client';
import React from 'react';
import { AuthProvider } from '../../lib/auth';
import dynamic from 'next/dynamic';
const Navbar = dynamic(() => import('../../components/Navbar'), { ssr: false });
import MangaCard from '../../components/MangaCard';
import { mangaApi } from '../../lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdBanner from '../../components/AdBanner';

const GENRES = [
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
];

const ORDERS = [
  { label: 'Latest', value: 0, icon: 'update' },
  { label: 'Newest', value: 1, icon: 'new_releases' },
  { label: 'A-Z', value: 3, icon: 'sort_by_alpha' },
];

const STATUSES = [
  { label: 'All', value: 0 },
  { label: 'Ongoing', value: 1 },
  { label: 'Completed', value: 2 },
  { label: 'Cancelled', value: 3 },
];

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = React.useState(500); // ⚡ Assume 500 for general browse, same as home
  const [totalResults, setTotalResults] = React.useState(0);
  const [keyword, setKeyword] = React.useState(searchParams.get('q') || searchParams.get('keyword') || '');
  const [inputKeyword, setInputKeyword] = React.useState(searchParams.get('q') || searchParams.get('keyword') || '');
  const [showFilter, setShowFilter] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Filter states
  const [genreState, setGenreState] = React.useState(() => {
    const inc = searchParams.get('include')?.split(',') || [];
    const exc = searchParams.get('exclude')?.split(',') || [];
    const state = {};
    inc.forEach(s => s && (state[s] = 'include'));
    exc.forEach(s => s && (state[s] = 'exclude'));
    return state;
  });

  const [selectedStatus, setSelectedStatus] = React.useState(parseInt(searchParams.get('status')) || 0);
  const [selectedOrder, setSelectedOrder] = React.useState(parseInt(searchParams.get('order')) || 0);
  const [genreMode, setGenreMode] = React.useState(searchParams.get('include_mode') === 'or' ? 'or' : 'and');

  const fetchResults = React.useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const include = Object.entries(genreState).filter(([, v]) => v === 'include').map(([k]) => k);
      const exclude = Object.entries(genreState).filter(([, v]) => v === 'exclude').map(([k]) => k);

      const qs = new URLSearchParams();
      if (include.length > 0) qs.set('include', include.join(','));
      if (exclude.length > 0) qs.set('exclude', exclude.join(','));
      if (selectedStatus > 0) qs.set('status', selectedStatus);
      if (selectedOrder > 0) qs.set('order', selectedOrder);
      if (keyword) qs.set('keyword', keyword);
      if (genreMode === 'or') qs.set('include_mode', 'or');
      qs.set('page', p);

      const { data } = await mangaApi.browseRaw(qs.toString());
      const rawResults = data.results || [];

      // 🛡️ Safe-Gate Shield: Hide restricted content unless specifically requested or searched
      const BLACKLIST_SLUGS = [
        '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'harem', 'yaoi', 'yuri',
        'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
      ];

      const hasRestrictedTag = include.some(tag =>
        BLACKLIST_SLUGS.includes(tag.toLowerCase()) ||
        BLACKLIST_SLUGS.includes(tag.toLowerCase().replace(/\s+/g, '-'))
      );
      // 🚀 UNLOCK: Bypass filter if there's an explicit search keyword OR a restricted tag is included
      // We also check for common 18+ keywords just in case
      const adultKeywords = ['secret class', 'adult', 'smut', 'hentai', 'ecchi', '18+'];
      const isAdultKeyword = keyword && adultKeywords.some(kw => keyword.toLowerCase().includes(kw));
      const shouldBypassFilter = !!keyword || hasRestrictedTag || isAdultKeyword;

      const filtered = shouldBypassFilter ? rawResults : rawResults.filter(m => {
        const genres = m.genres || [];
        const tagNames = genres.map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
        return !tagNames.some(tag => BLACKLIST_SLUGS.includes(tag)) && !m.nsfw;
      });

      setResults(filtered);

      // ⚡ Only update totalPages if we have a search/filter, otherwise keep the 500 assumption
      const hasFilters = keyword || Object.keys(genreState).length > 0 || selectedStatus > 0;

      if (hasFilters) {
        if (data.totalPages && data.totalPages > 1) {
          setTotalPages(data.totalPages);
        } else if (data.totalResults) {
          setTotalPages(Math.ceil(data.totalResults / 20) || 1);
        }
      } else {
        setTotalPages(500);
      }

      setTotalResults(data.totalResults || 0);
      setPage(p);
    } catch (err) {
      // Suppress console error
    } finally {
      setLoading(false);
    }
  }, [genreState, selectedStatus, selectedOrder, keyword]);

  // ⚡ Sync state with URL
  React.useEffect(() => {
    const p = parseInt(searchParams.get('page')) || 1;
    const q = searchParams.get('keyword') || searchParams.get('q') || '';
    const status = parseInt(searchParams.get('status')) || 0;
    const order = parseInt(searchParams.get('order')) || 0;
    const inc = searchParams.get('include')?.split(',') || [];
    const exc = searchParams.get('exclude')?.split(',') || [];

    // Update local states if they differ from URL
    if (p !== page) setPage(p);
    if (q !== keyword) { setKeyword(q); setInputKeyword(q); }
    if (status !== selectedStatus) setSelectedStatus(status);
    if (order !== selectedOrder) setSelectedOrder(order);

    // Sync genre state
    const newGenreState = {};
    inc.forEach(s => s && (newGenreState[s] = 'include'));
    exc.forEach(s => s && (newGenreState[s] = 'exclude'));
    if (JSON.stringify(newGenreState) !== JSON.stringify(genreState)) {
      setGenreState(newGenreState);
    }

    fetchResults(p);
  }, [searchParams]);

  // Remove the old redundant effects that were calling fetchResults
  /*
  React.useEffect(() => {
    fetchResults(page);
  }, [keyword, page, selectedOrder, genreState, selectedStatus, genreMode]);
  */

  // ⚡ INSTANT SEARCH: Fetch results as user types (with debounce)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputKeyword !== keyword) {
        setKeyword(inputKeyword);
        setPage(1);
      }
    }, 600); // 600ms debounce
    return () => clearTimeout(timer);
  }, [inputKeyword, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setGenreState({}); // ⚡ Reset filters for global search
    setKeyword(inputKeyword);
    setPage(1);
    setShowFilter(false);
  };

  const handleApply = () => {
    setPage(1);
    setShowFilter(false);
    fetchResults(1);
  };

  const handleReset = () => {
    setGenreState({});
    setSelectedStatus(0);
    setSelectedOrder(0);
    setKeyword('');
    setInputKeyword('');
    setPage(1);
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    const qs = new URLSearchParams(window.location.search);
    qs.set('page', p);
    router.push(`/browse?${qs.toString()}`);
    // Scroll will be handled by browser or we can keep it for smoothness
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cycleGenre = (slug) => {
    setGenreState(prev => {
      const cur = prev[slug];
      if (!cur) return { ...prev, [slug]: 'include' };
      if (cur === 'include') return { ...prev, [slug]: 'exclude' };
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="page-wrapper" suppressHydrationWarning>
      {!mounted ? (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="skeleton" style={{ height: 400, width: '80%', borderRadius: 18 }} />
        </div>
      ) : (
        <>
          <Navbar />
          <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>

            {/* ── Breadcrumb ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 24 }}>
              <Link href="/" style={{ color: 'var(--accent)' }}>Home</Link>
              <span className="material-icons" style={{ fontSize: '1rem' }}>chevron_right</span>
              <Link href="/browse" style={{ color: 'var(--accent)' }}>Browse</Link>
              <span className="material-icons" style={{ fontSize: '1rem' }}>chevron_right</span>
              <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Page {page}</span>
            </div>

            {/* ── Header Section ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 32 }}>
              <div>
                <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
                  Explore our <span style={{ color: 'var(--accent)' }}>Collection</span>
                </h1>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{totalResults.toLocaleString()} gems</span> discovered
                  <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                  Sorted by <span style={{ color: 'var(--text-2)', fontWeight: 700 }}>{ORDERS.find(o => o.value === selectedOrder)?.label || 'Latest'}</span>
                </div>
              </div>

              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 450 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '1.2rem' }}>search</span>
                  <input
                    type="text"
                    placeholder="Search our collection..."
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 14px 14px 44px', borderRadius: 14,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: '0.95rem', fontWeight: 500,
                      outline: 'none', transition: 'all 0.2s',
                    }}
                  />
                </div>
                <button type="submit" className="btn jewel-btn" style={{ padding: '0 24px', borderRadius: 14 }}>Search</button>
              </form>
            </div>

            <AdBanner size="small" slot="8394012347" /> {/* Use your real slot ID here */}

            {/* ── Controls Area ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="btn btn-secondary"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12,
                  background: showFilter ? 'var(--accent)' : 'var(--surface)',
                  color: showFilter ? '#fff' : 'var(--text)',
                  borderColor: showFilter ? 'var(--accent)' : 'var(--border)',
                  padding: '10px 20px',
                }}
              >
                <span className="material-icons">{showFilter ? 'close' : 'filter_list'}</span>
                {showFilter ? 'Hide Filter' : 'Filter'}
              </button>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>Page {page}</div>
            </div>

            {/* ── Toggleable Filter Window ── */}
            {showFilter && (
              <div className="filter-window" style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 24, marginBottom: 32,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                animation: 'slideDown 0.3s ease-out',
              }}>
                {/* Filter Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Filter</h3>
                  <button onClick={() => setShowFilter(false)} style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    <span className="material-icons">close</span> Hide Filter
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* Line 1: Order By & Instructions */}
                  <div className="filter-grid">
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Order By</div>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={selectedOrder}
                          onChange={(e) => setSelectedOrder(parseInt(e.target.value))}
                          style={{
                            width: '100%', padding: '14px 20px', borderRadius: 14,
                            background: 'var(--surface-2)', border: '1px solid var(--border)',
                            color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600,
                            appearance: 'none', cursor: 'pointer', outline: 'none'
                          }}
                        >
                          {ORDERS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <span className="material-icons" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }}>expand_more</span>
                      </div>
                    </div>

                    <div style={{ padding: '16px 20px', background: 'rgba(108,99,255,0.05)', borderRadius: 18, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Instructions</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Click once to <b>Include</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Click twice to <b>Exclude</b></span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', width: '100%', marginTop: 2 }}>
                          Mix and match genres to find your perfect read.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line 2: Status & Genre Mode */}
                  <div className="filter-grid" style={{ alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Status</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {STATUSES.map(s => (
                          <button
                            key={s.value}
                            onClick={() => setSelectedStatus(s.value)}
                            style={{
                              padding: '10px 16px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
                              background: selectedStatus === s.value ? 'rgba(108,99,255,0.15)' : 'var(--surface-2)',
                              color: selectedStatus === s.value ? 'var(--accent)' : 'var(--text-2)',
                              border: `1px solid ${selectedStatus === s.value ? 'var(--accent)' : 'var(--border)'}`,
                              cursor: 'pointer', flex: 1
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Genre Mode</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setGenreMode('and')}
                          style={{
                            padding: '10px 16px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
                            background: genreMode === 'and' ? 'rgba(108,99,255,0.15)' : 'var(--surface-2)',
                            color: genreMode === 'and' ? 'var(--accent)' : 'var(--text-2)',
                            border: `1px solid ${genreMode === 'and' ? 'var(--accent)' : 'var(--border)'}`,
                            cursor: 'pointer', flex: 1
                          }}
                        >
                          And (All)
                        </button>
                        <button
                          onClick={() => setGenreMode('or')}
                          style={{
                            padding: '10px 16px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
                            background: genreMode === 'or' ? 'rgba(108,99,255,0.15)' : 'var(--surface-2)',
                            color: genreMode === 'or' ? 'var(--accent)' : 'var(--text-2)',
                            border: `1px solid ${genreMode === 'or' ? 'var(--accent)' : 'var(--border)'}`,
                            cursor: 'pointer', flex: 1
                          }}
                        >
                          Or (Any)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Line 4: Genres Section */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>All Genres</div>
                    <div className="genres-grid">
                      {GENRES.map(g => {
                        const state = genreState[g.slug];
                        let active = !!state;
                        let color = 'var(--text-3)', bg = 'transparent', border = 'var(--border)';
                        if (state === 'include') { color = 'var(--green)'; border = 'var(--green)'; bg = 'rgba(34,211,160,0.05)'; }
                        if (state === 'exclude') { color = 'var(--red)'; border = 'var(--red)'; bg = 'rgba(255,77,109,0.05)'; }

                        return (
                          <div
                            key={g.slug}
                            onClick={() => cycleGenre(g.slug)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                              padding: '6px 10px', borderRadius: 8, transition: 'all 0.15s',
                              background: bg,
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: 4, border: `2px solid ${border}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: state === 'include' ? 'var(--green)' : state === 'exclude' ? 'var(--red)' : 'transparent',
                              borderColor: border,
                            }}>
                              {state === 'include' && <span className="material-icons" style={{ color: '#fff', fontSize: '0.7rem' }}>check</span>}
                              {state === 'exclude' && <span className="material-icons" style={{ color: '#fff', fontSize: '0.7rem' }}>close</span>}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: active ? color : 'var(--text-2)' }}>{g.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                  <button onClick={handleApply} className="btn btn-primary" style={{ padding: '14px 40px', borderRadius: 14 }}>Apply Filters</button>
                  <button onClick={handleReset} className="btn btn-ghost" style={{ padding: '14px 40px', borderRadius: 14, color: 'var(--red)' }}>Reset All</button>
                </div>
              </div>
            )}

            {/* ── Main Content Area ── */}
            <main>
              <div className="manga-grid">
                {results.map((m, i) => (
                  <MangaCard key={`${m.id}-${i}`} manga={m} priority={i < 8} />
                ))}
                {loading && results.length === 0 && (
                  Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18 }} />
                  ))
                )}
              </div>

              {results.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                  <span className="material-icons" style={{ fontSize: '4rem', marginBottom: 16 }}>sentiment_dissatisfied</span>
                  <p>No results found matching your criteria.</p>
                  <button onClick={handleReset} className="btn btn-ghost" style={{ marginTop: 16 }}>Clear Filters</button>
                </div>
              )}

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

                  {!getPageNumbers().includes(1) && (
                    <>
                      <button onClick={() => handlePageChange(1)} className="btn-page">1</button>
                      {!getPageNumbers().includes(2) && <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>...</span>}
                    </>
                  )}

                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="btn-page" style={{ opacity: page === 1 ? 0.3 : 1 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>chevron_left</span>
                  </button>

                  {getPageNumbers().map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`btn-page ${p === page ? 'active' : ''}`}
                    >
                      {p}
                    </button>
                  ))}

                  <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="btn-page" style={{ opacity: page >= totalPages ? 0.3 : 1 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>chevron_right</span>
                  </button>

                  {!getPageNumbers().includes(totalPages) && (
                    <>
                      {!getPageNumbers().includes(totalPages - 1) && <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>...</span>}
                      <button onClick={() => handlePageChange(totalPages)} className="btn-page">{totalPages}</button>
                    </>
                  )}
                </div>
              )}
            </main>

            <style jsx>{`
          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
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
          .filter-window {
            padding: 32px;
          }
          .filter-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .genres-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 10px;
            max-height: 40vh;
            overflow-y: auto;
            padding-right: 10px;
            padding-bottom: 10px;
          }
          @media (max-width: 768px) {
            .filter-window {
              padding: 20px;
            }
            .filter-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .genres-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
          </div>
        </>
      )}
    </div>
  );
}

export default function BrowseClient() {
  return (
    <AuthProvider>
      <BrowseContent />
    </AuthProvider>
  );
}
