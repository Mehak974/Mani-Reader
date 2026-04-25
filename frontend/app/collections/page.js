'use client';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import MangaCard from '../../components/MangaCard';
import { libraryApi } from '../../lib/api';
import { useRouter } from 'next/navigation';

import LoginRequiredModal from '../../components/LoginRequiredModal';

function CollectionsContent() {
  const { user, loading: authLoading } = useAuth() || {};
  const router = useRouter();

  const [collections,  setCollections]  = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [newName,      setNewName]      = useState('');
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    libraryApi.list()
      .then((r) => { 
        setCollections(r.data || []); 
        if (r.data?.length > 0) setSelected(r.data[0].id); 
      })
      .catch(() => showToast('Failed to load collections', 'error'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function createCollection() {
    if (!newName.trim()) return;
    try {
      const { data } = await libraryApi.create(newName.trim());
      setCollections((prev) => [...prev, { ...data, items: [] }]);
      setSelected(data.id);
      setNewName('');
      showToast('Collection created ✓');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed', 'error');
    }
  }

  async function deleteCollection(id) {
    if (!confirm('Delete this collection?')) return;
    try {
      await libraryApi.delete(id);
      setCollections((prev) => prev.filter((l) => l.id !== id));
      if (selected === id) setSelected(collections[0]?.id || null);
      showToast('Collection deleted');
    } catch { showToast('Failed', 'error'); }
  }

  async function removeFromCollection(collectionId, mangaId) {
    try {
      await libraryApi.remove(collectionId, mangaId);
      setCollections((prev) => prev.map((l) =>
        l.id === collectionId ? { ...l, items: l.items.filter((i) => i.mangaId !== mangaId) } : l
      ));
      showToast('Removed');
    } catch { showToast('Failed', 'error'); }
  }

  const activeColl = collections.find((l) => l.id === selected);

  return (
    <div className="page-wrapper">
      <Navbar />

      {!user && !authLoading && (
        <LoginRequiredModal 
          pageName="Collections" 
          onCancel={() => router.push('/')} 
        />
      )}

      <div className="container section">
        <div className="section-header">
          <h1 className="section-title">📁 My <span>Collections</span></h1>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)' }}>Loading...</div>
        ) : (
          <div className="collections-layout">
            {/* Sidebar */}
            <div>
              {/* Create new */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  className="form-input"
                  placeholder="New collection name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createCollection()}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button className="btn btn-primary btn-sm" onClick={createCollection}>+</button>
              </div>

              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setSelected(col.id)}
                  style={{
                    padding: '12px 16px', borderRadius: 12, marginBottom: 6, cursor: 'pointer',
                    background: selected === col.id ? 'var(--accent)' : 'var(--surface)',
                    border: `1px solid ${selected === col.id ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'var(--transition)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{col.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{col.items?.length || 0} manga</div>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'rgba(255,77,109,0.2)', color: 'var(--red)', padding: '4px 8px' }}
                    onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}
                  >✕</button>
                </div>
              ))}

              {collections.length === 0 && (
                <div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>
                  Create your first collection above.
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              {activeColl ? (
                <>
                  <h2 style={{ marginBottom: 24, fontWeight: 700 }}>{activeColl.name}</h2>
                  {activeColl.items?.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '60px 0' }}>
                      This collection is empty. Add manga from a manga detail page.
                    </div>
                  ) : (
                    <div className="manga-grid">
                      {activeColl.items?.map((item) => (
                        <div key={item.mangaId} style={{ position: 'relative' }}>
                          <MangaCard manga={item.manga} />
                          <button
                            onClick={() => removeFromCollection(activeColl.id, item.mangaId)}
                            style={{
                              position: 'absolute', top: 8, left: 8,
                              background: 'rgba(255,77,109,0.85)', color: '#fff',
                              border: 'none', borderRadius: 8, padding: '4px 8px',
                              fontSize: '0.75rem', cursor: 'pointer', zIndex: 5
                            }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '80px 0' }}>
                  Select or create a collection to get started.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <style jsx>{`
        .collections-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
        }
        @media (max-width: 768px) {
          .collections-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function CollectionsPage() {
  return <AuthProvider><CollectionsContent /></AuthProvider>;
}
