'use client';
import React from 'react';
import { AuthProvider, useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { authApi, historyApi, bookmarkApi, libraryApi, progressApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ value, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 99, flexShrink: 0,
        background: value ? 'var(--accent)' : 'var(--surface-3)',
        border: `2px solid ${value ? 'var(--accent)' : 'var(--border)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'all 0.25s',
        boxShadow: value ? '0 0 12px var(--accent-glow)' : 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: value ? 'calc(100% - 22px)' : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

// ── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, title, desc, children, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderRadius: 12,
      background: danger ? 'rgba(255,77,109,0.04)' : 'var(--surface)',
      border: `1px solid ${danger ? 'rgba(255,77,109,0.2)' : 'var(--border)'}`,
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <span className="material-icons" style={{ color: danger ? 'var(--red)' : 'var(--accent)', fontSize: '1.3rem', flexShrink: 0 }}>
          {icon}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: danger ? 'var(--red)' : 'var(--text)' }}>{title}</div>
          {desc && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 3 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 32 }}>
      <span className="material-icons" style={{ color: 'var(--text-3)', fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {title}
      </span>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = 'var(--accent)', loading }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)`,
      }} />
      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, marginBottom: 4 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Main Settings Content ─────────────────────────────────────────────────────
import LoginRequiredModal from '../../components/LoginRequiredModal';

function SettingsContent() {
  const { user, loading: authLoading } = useAuth() || {};
  const router = useRouter();

  const [incognito,    setIncognito]    = React.useState(false);
  const [hideAdult,    setHideAdult]    = React.useState(false);
  const [toast,        setToast]        = React.useState(null);
  const [stats,        setStats]        = React.useState(null);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [clearing,     setClearing]     = React.useState(false);
  const [deleting,     setDeleting]     = React.useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  // Load preferences from localStorage
  React.useEffect(() => {
    try {
      setIncognito(localStorage.getItem('mv_incognito') === 'true');
      setHideAdult(localStorage.getItem('mv_hide_adult') === 'true');
    } catch {}
  }, []);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatsLoading(false);
      return;
    }
    loadStats();
  }, [user, authLoading]);

  async function loadStats() {
    setStatsLoading(true);
    try {
      const [histRes, bmRes, colRes] = await Promise.allSettled([
        historyApi.list(0, 1000),
        bookmarkApi.list(),
        libraryApi.list(),
      ]);

      const history   = histRes.status === 'fulfilled' ? (histRes.value.data || []) : [];
      const bookmarks = bmRes.status   === 'fulfilled' ? (bmRes.value.data   || []) : [];
      const cols      = colRes.status  === 'fulfilled' ? (colRes.value.data  || []) : [];

      const totalManga    = new Set(history.map(h => h.mangaId)).size;
      const totalChapters = history.length;
      const totalInCols   = cols.reduce((s, c) => s + (c.items?.length || 0), 0);
      const totalBm       = bookmarks.length;

      // Use real timeSpent from user profile if available, otherwise fallback to estimate
      const actualMs = user?.timeSpent || (totalChapters * 5 * 60 * 1000);
      const hours    = Math.floor(actualMs / 1000 / 60 / 60);
      const mins     = Math.floor((actualMs / 1000 / 60) % 60);
      const readTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      setStats({ totalManga, totalChapters, totalInCols, totalBm, readTime, colCount: cols.length });
    } catch {}
    finally { setStatsLoading(false); }
  }

  function toggleIncognito(val) {
    setIncognito(val);
    try { localStorage.setItem('mv_incognito', val ? 'true' : 'false'); } catch {}
    showToast(val ? '🕶️ Incognito ON — history paused' : '👁️ Incognito OFF — tracking resumed');
  }

  function toggleHideAdult(val) {
    setHideAdult(val);
    try { localStorage.setItem('mv_hide_adult', val ? 'true' : 'false'); } catch {}
    authApi.nsfw(!val).catch(() => {}); // sync to backend
    showToast(val ? 'Adult content hidden' : 'Adult content visible');
  }


  async function clearHistory() {
    if (!confirm('Clear all reading history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await historyApi.clear();
      showToast('History cleared ✓');
      loadStats();
    } catch { showToast('Failed', 'error'); }
    finally { setClearing(false); }
  }

  async function handleDeleteAccount() {
    const confirmDelete = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will erase all your history, collections, and bookmarks.');
    if (!confirmDelete) return;
    
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      showToast('Account deleted. Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    } catch {
      showToast('Failed to delete account', 'error');
      setDeleting(false);
    }
  }


  return (
    <div className="page-wrapper">
      <Navbar />

      {!user && !authLoading && (
        <LoginRequiredModal 
          pageName="Settings" 
          onCancel={() => router.push('/')} 
        />
      )}

      <div className="container" style={{ maxWidth: 780, paddingTop: 48, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>
            ⚙️ Settings
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>
            Manage your preferences, privacy, and account.
          </p>
        </div>

        {/* ── Statistics ─────────────────────────────────── */}
        <SectionTitle icon="bar_chart" title="Statistics" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          <StatCard icon="📖" label="Manga Read"       value={stats?.totalManga}    loading={statsLoading} />
          <StatCard icon="📋" label="Chapters Read"    value={stats?.totalChapters} loading={statsLoading} color="var(--green)" />
          <StatCard icon="⏱️" label="Read Time"        value={stats?.readTime}      loading={statsLoading} color="var(--accent-2)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard icon="📁" label="Collections"      value={stats?.colCount}      loading={statsLoading} color="#f59e0b" />
          <StatCard icon="📚" label="In Collections"   value={stats?.totalInCols}   loading={statsLoading} color="#10b981" />
          <StatCard icon="🔖" label="Bookmarks"        value={stats?.totalBm}       loading={statsLoading} color="var(--red)" />
        </div>

        {/* ── Privacy ────────────────────────────────────── */}
        <SectionTitle icon="shield" title="Privacy" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow
            icon="visibility_off"
            title="Incognito Mode"
            desc="History is paused and chapters are not marked as read while active."
          >
            <Toggle value={incognito} onChange={toggleIncognito} />
          </SettingRow>

          {incognito && (
            <div style={{
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
              fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>info</span>
              Incognito is ON — your reading activity is not being recorded.
            </div>
          )}
        </div>

        {/* ── Browse Preferences ─────────────────────────── */}
        <SectionTitle icon="explore" title="Browse Preferences" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow
            icon="no_adult_content"
            title="Hide Adult Content"
            desc="Filter out mature (18+) titles from search results and browse pages."
          >
            <Toggle value={hideAdult} onChange={toggleHideAdult} />
          </SettingRow>
        </div>

        {/* ── Danger Zone ────────────────────────────────── */}
        <SectionTitle icon="warning" title="Danger Zone" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow
            icon="delete_sweep"
            title="Clear Reading History"
            desc="Permanently delete all reading history. Stats will reset."
            danger
          >
            <button
              onClick={clearHistory}
              disabled={clearing}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
                background: 'rgba(255,77,109,0.12)', color: 'var(--red)',
                border: '1px solid rgba(255,77,109,0.3)', cursor: 'pointer',
                opacity: clearing ? 0.6 : 1, whiteSpace: 'nowrap',
              }}
            >
              {clearing ? 'Clearing…' : 'Clear History'}
            </button>
          </SettingRow>

          <SettingRow
            icon="person_remove"
            title="Delete Account"
            desc="Permanently delete your profile, collections, bookmarks, and all associated data."
            danger
          >
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
                background: 'var(--red)', color: '#fff',
                border: 'none', cursor: 'pointer',
                opacity: deleting ? 0.6 : 1, whiteSpace: 'nowrap',
              }}
            >
              {deleting ? 'Deleting…' : 'Delete Profile'}
            </button>
          </SettingRow>
        </div>

      </div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default function SettingsPage() {
  return <AuthProvider><SettingsContent /></AuthProvider>;
}
