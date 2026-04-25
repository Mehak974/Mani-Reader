'use client';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../../lib/auth';
import Navbar from '../../../components/Navbar';
import MangaCard from '../../../components/MangaCard';
import ChapterList from '../../../components/ChapterList';
import { mangaApi, libraryApi, progressApi, bookmarkApi } from '../../../lib/api';

export default function MangaDetailClient({ id, initialManga }) {
  const { user } = useAuth() || {};

  const [manga,    setManga]    = useState(initialManga);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [libraries,setLibraries]= useState([]);
  const [related,  setRelated]  = useState([]);

  const [loading,  setLoading]  = useState(!initialManga);
  const [error,    setError]    = useState(null);
  const [toast,    setToast]    = useState(null);
  const [libModal, setLibModal] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, chaptersRes] = await Promise.all([
          mangaApi.info(id),
          mangaApi.chapters(id)
        ]);
        
        setManga(infoRes.data);
        setChapters(chaptersRes.data.chapters || []);
        
        // If genres are missing, refresh after 2s
        if (!infoRes.data?.genres || infoRes.data.genres.length === 0) {
           setTimeout(() => mangaApi.info(id).then(r2 => setManga(r2.data)), 2000);
        }
      } catch (e) {
        if (!initialManga) setError(e.response?.data?.error || 'Failed to load manga');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (user) {
      progressApi.forManga(id).then((r) => setProgress(r.data || [])).catch(() => {});
      libraryApi.list().then((r) => setLibraries(r.data || [])).catch(() => {});
    }

    // Fetch related manga for internal linking architecture
    mangaApi.related(id).then((r) => setRelated(r.data || [])).catch(() => {});
  }, [id, user, initialManga]);

  async function addToCollection(libraryId) {
    try {
      await libraryApi.add(libraryId, id);
      showToast('Added to collection ✓');
      setLibModal(false);
    } catch { showToast('Failed to add', 'error'); }
  }

  async function handleCreateCollection(e) {
    e.preventDefault();
    const name = e.target.libName.value.trim();
    if (!name) return;
    try {
      const res = await libraryApi.create(name);
      const newLib = res.data;
      setLibraries([newLib, ...libraries]);
      await addToCollection(newLib.id);
      e.target.reset();
    } catch { showToast('Failed to create collection', 'error'); }
  }

  async function handleRate(score) {
    if (!user) return showToast('Login to rate', 'error');
    try {
      await mangaApi.rate(id, score);
      const res = await mangaApi.info(id);
      setManga(res.data);
      showToast('Rating saved ✓');
    } catch (err) { 
      console.error('Rate failed:', err);
      showToast('Failed to rate', 'error'); 
    }
  }

  function RatingStars({ rating, onRate }) {
    const [hover, setHover] = useState(0);

    return (
      <div 
        style={{ display: 'flex', gap: 4, alignItems: 'center' }}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const isActive = star <= (hover || rating);
          return (
            <span 
              key={star} 
              onClick={() => onRate && onRate(star)}
              onMouseEnter={() => setHover(star)}
              className="material-icons"
              style={{ 
                cursor: onRate ? 'pointer' : 'default', 
                color: isActive ? '#facc15' : 'var(--border)', 
                fontSize: '1.6rem',
                transition: 'all 0.2s ease',
                transform: star === hover ? 'scale(1.2)' : 'scale(1)',
                textShadow: isActive ? '0 0 10px rgba(250, 204, 21, 0.4)' : 'none'
              }}
            >
              {isActive ? 'star' : 'star_border'}
            </span>
          );
        })}
      </div>
    );
  }

  const coverUrl = manga?.cover
    ? `/api/image?url=${encodeURIComponent(manga.cover)}`
    : '/placeholder-cover.jpg';

  const readCount = progress.filter((p) => p.isRead).length;
  const lastRead  = progress.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  if (loading) return (
    <div className="page-wrapper"><Navbar />
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 40 }}>
          <div className="skeleton" style={{ height: 340, borderRadius: 18 }} />
          <div>
            <div className="skeleton skeleton-text" style={{ height: 36, width: '70%', marginBottom: 16 }} />
            <div className="skeleton skeleton-text" style={{ width: '90%' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="page-wrapper"><Navbar />
      <div className="container section" style={{ textAlign: 'center', color: 'var(--red)' }}>{error}</div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        {/* Header */}
        <div className="manga-detail-header">
          <div className="manga-detail-cover">
            <img src={coverUrl} alt={manga?.title} onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }} />
          </div>
          <div className="manga-detail-meta">
            <h1 className="glow-text" style={{ fontSize: '2.5rem' }}>{manga?.title}</h1>
            {manga?.status && (
              <div className="manga-detail-status" style={{ border: '1px solid var(--border)', background: 'var(--surface-3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: manga.status === 'Ongoing' ? 'var(--green)' : 'var(--text-3)', display: 'inline-block', boxShadow: manga.status === 'Ongoing' ? '0 0 10px var(--green)' : 'none' }} />
                {manga.status}
              </div>
            )}

            {readCount > 0 && (
              <div style={{ marginBottom: 16, color: 'var(--text-3)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>auto_stories</span>
                <span>{readCount} / {chapters.length} chapters read</span>
                {lastRead && <span style={{ opacity: 0.6 }}> · Last: Ch. {chapters.find(c => c.id === lastRead.chapterId)?.number}</span>}
              </div>
            )}

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Rate Manga...</span>
                <RatingStars rating={manga?.userRating || 0} onRate={handleRate} />
              </div>
              {manga?.averageRating && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem', color: '#fbbf24' }}>star</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{manga.averageRating}</span> Avg
                </div>
              )}
            </div>

            {user && user.role === 'ADMIN' && (
              <div style={{ marginBottom: 16, padding: '6px 12px', background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'orange', fontWeight: 700 }}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>admin_panel_settings</span>
                Admin View: Total Reads System-Wide: {manga?.readCount || 0}
              </div>
            )}

            {manga?.description && (
              <p className="manga-detail-desc" style={{ fontSize: '0.95rem', opacity: 0.9 }}>{manga.description}</p>
            )}

            <div className="manga-detail-actions" style={{ marginTop: 16 }}>
              {chapters.length > 0 && (
                <a
                  href={`/read/${lastRead ? chapters.find(c => c.id === lastRead.chapterId)?.id || chapters[0].id : chapters[0].id}?mangaId=${id}`}
                  style={{ display: 'inline-block' }}
                >
                  <button 
                    className="btn btn-amethyst" 
                    style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: '12px' }}
                  >
                    <span className="material-icons" style={{ fontSize: '1.2rem', marginRight: 8 }}>play_circle_filled</span>
                    Start Reading
                  </button>
                </a>
              )}
              {user && (
                <button className="btn btn-ghost" style={{ border: '1px solid var(--border)', padding: '14px 24px' }} onClick={() => setLibModal(true)}>
                  <span className="material-icons" style={{ fontSize: '1.2rem', marginRight: 4 }}>add_box</span>
                  Add to Collection
                </button>
              )}
            </div>

            {manga?.genres?.length > 0 && (
              <div className="genre-tags" style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {manga.genres.map((g, i) => (
                  <span key={i} className="genre-tag" style={{ 
                    background: 'var(--surface-2)', 
                    border: '1px solid var(--border)', 
                    color: 'var(--text-2)', 
                    padding: '6px 16px', 
                    borderRadius: 99, 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}>
                    {typeof g === 'string' ? g : g.name || g.title || JSON.stringify(g)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title" style={{ marginBottom: 24 }}>
            Chapters <span>({chapters.length})</span>
          </h2>
          <ChapterList 
            chapters={chapters} 
            mangaId={id} 
            progress={progress} 
          />
        </section>

        {/* Related Manga (Internal Linking Hub) */}
        {related.length > 0 && (
          <section className="section" style={{ borderTop: '1px solid var(--border)', marginTop: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 24 }}>
              Recommended <span>for You</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
              {related.map((m) => (
                <MangaCard key={m.id} manga={m} />
              ))}
            </div>
          </section>
        )}
      </div>

      {libModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }} onClick={() => setLibModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32, minWidth: 360, maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Add to Collection</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 24, paddingRight: 8 }}>
              {libraries.map((lib) => (
                <button key={lib.id} className="btn btn-ghost w-full" style={{ marginBottom: 8, justifyContent: 'flex-start', padding: '12px 16px' }} onClick={() => addToCollection(lib.id)}>
                  📚 {lib.name} <span style={{ color: 'var(--text-3)', marginLeft: 'auto', fontSize: '0.8rem' }}>{lib.items?.length || 0} manga</span>
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <form onSubmit={handleCreateCollection} style={{ display: 'flex', gap: 8 }}>
                <input name="libName" className="search-input" placeholder="New collection name..." required style={{ flex: 1, marginBottom: 0 }} />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>Create</button>
              </form>
            </div>
            <button className="btn btn-ghost w-full" style={{ marginTop: 20 }} onClick={() => setLibModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
