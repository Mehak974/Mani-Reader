'use client';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../../lib/auth';
import Navbar from '../../../components/Navbar';
import MangaCard from '../../../components/MangaCard';
import ChapterList from '../../../components/ChapterList';
import AdBanner from '../../../components/AdBanner';
import { mangaApi, libraryApi, progressApi, bookmarkApi } from '../../../lib/api';

export default function MangaDetailClient({ id, initialManga }) {
  const { user } = useAuth() || {};

  const [manga, setManga] = useState(initialManga);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [related, setRelated] = useState([]);

  const [loading, setLoading] = useState(!initialManga);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
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
      progressApi.forManga(id).then((r) => setProgress(r.data || [])).catch(() => { });
      libraryApi.list().then((r) => setLibraries(r.data || [])).catch(() => { });
    }

    // Fetch related manga for internal linking architecture
    mangaApi.related(id).then((r) => setRelated(r.data || [])).catch(() => { });
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
    ? (manga.cover.startsWith('http') && !manga.cover.includes('/api/image') && !manga.cover.includes('workers.dev')
        ? `/api/image?url=${encodeURIComponent(manga.cover)}` 
        : manga.cover)
    : '/placeholder-cover.jpg';

  const readCount = progress.filter((p) => p.isRead).length;
  const lastRead = progress.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

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
        {/* 🏆 Two-Phase Premium Layout */}
        <div className="manga-detail-container">
          <style jsx>{`
            .manga-detail-container {
              display: grid;
              grid-template-columns: 260px 1fr;
              gap: 40px;
              padding: 40px 0;
            }
            .manga-header-row {
              display: contents;
            }
            .manga-detail-cover img {
              width: 100%;
              height: auto;
              border-radius: 18px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
              border: 1px solid var(--border);
              display: block;
            }
            .manga-detail-meta {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .manga-title {
              font-size: 3rem;
              font-weight: 900;
              line-height: 1.1;
              letter-spacing: -0.02em;
            }
            
            /* Action Row for Web/Tablet */
            .action-row {
              grid-column: 2;
              display: flex;
              gap: 16px;
              margin-top: 24px;
            }

            @media (max-width: 1024px) {
              .manga-detail-container {
                grid-template-columns: 200px 1fr;
                gap: 24px;
              }
              .manga-title { font-size: 2.2rem; }
            }

            @media (max-width: 768px) {
              .manga-detail-container {
                grid-template-columns: 1fr;
                gap: 24px;
                padding: 16px 0;
              }
              
              .manga-header-row {
                display: flex !important;
                flex-direction: column;
                gap: 20px;
                text-align: center;
                align-items: center;
              }

              .manga-detail-cover {
                width: 180px;
                margin: 0 auto;
                box-shadow: 0 15px 30px rgba(0,0,0,0.5);
              }

              .manga-detail-meta {
                align-items: center;
              }

              .manga-title { 
                font-size: 1.8rem !important; 
                text-align: center;
              }

              .action-row {
                grid-column: 1;
                flex-direction: column;
                width: 100%;
                gap: 12px;
                margin-top: 0;
              }

              .action-row a, .action-row button {
                width: 100%;
                padding: 16px !important;
              }

              .genre-tag {
                padding: 4px 10px !important;
                font-size: 0.65rem !important;
              }
            }
          `}</style>

          {/* Line 1: Header (Web/Tablet: Side-by-side | Mobile: Side-by-side) */}
          <div className="manga-header-row">
            <div className="manga-detail-cover">
              <img src={coverUrl} alt={manga?.title} onError={(e) => { e.target.src = '/placeholder-cover.jpg'; }} />
            </div>

            <div className="manga-detail-meta">
              <h1 className="manga-title glow-text">{manga?.title}</h1>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {manga?.status && (
                  <div className="manga-detail-status" style={{ border: '1px solid var(--border)', background: 'var(--surface-3)', fontSize: '0.75rem', padding: '4px 10px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: manga.status === 'Ongoing' ? 'var(--green)' : 'var(--text-3)', display: 'inline-block' }} />
                    {manga.status}
                  </div>
                )}
                {manga?.averageRating && (
                  <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-icons" style={{ fontSize: '0.9rem' }}>star</span>
                    <span style={{ fontWeight: 700 }}>{manga.averageRating}</span>
                  </div>
                )}
              </div>

              {readCount > 0 && (
                <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>auto_stories</span>
                  <span>{readCount} / {chapters.length} chapters read</span>
                </div>
              )}

              {/* Description & Tags sit in meta for Web, but we can also use grid order */}
              <div className="description-line">
                {manga?.description && <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: 1.6 }}>{manga.description}</p>}
              </div>

              <div className="tags-line">
                {manga?.genres?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {manga.genres.map((g, i) => (
                      <span key={i} className="genre-tag" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', padding: '6px 14px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {typeof g === 'string' ? g : g.name || g.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Row: Line 4/5 on Mobile | Line 2 on Web/Tablet */}
          <div className="action-row">
            {chapters.length > 0 && (
              <div className="start-reading-line" style={{ flex: 1 }}>
                <a href={`/read/${lastRead ? chapters.find(c => c.id === lastRead.chapterId)?.id || chapters[0]?.id : chapters[0]?.id}?mangaId=${id}`}>
                  <button className="btn btn-amethyst w-full" style={{ padding: '14px 0', fontSize: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="material-icons">play_circle_filled</span>
                    Start Reading
                  </button>
                </a>
              </div>
            )}
            <div className="collection-line" style={{ flex: 1 }}>
              <button 
                className="btn btn-ghost w-full" 
                style={{ border: '1px solid var(--border)', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} 
                onClick={() => user ? setLibModal(true) : showToast('Login to add to collection', 'error')}
              >
                <span className="material-icons">add_box</span>
                Add to Collection
              </button>
            </div>
          </div>
        </div>

        <AdBanner slot="YOUR_SLOT_ID_HERE" />

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
