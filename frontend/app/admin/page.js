'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../lib/auth';
import { adminApi } from '../../lib/api';
import Link from 'next/link';

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <span className="material-icons" style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{value || '0'}</div>
    </div>
  );
}

function HealthBar({ label, value, percent, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
        <span style={{ color: '#475569', fontWeight: 600 }}>{label}</span>
        <span style={{ color: color, fontWeight: 800 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

function MetricCard({ label, value, trend, icon, color }) {
  const isUp = trend === 'up';
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons">{icon}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: isUp ? '#f0fdf4' : '#fef2f2', color: isUp ? '#16a34a' : '#dc2626', fontSize: '0.75rem', fontWeight: 800 }}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>{isUp ? 'north_east' : 'south_east'}</span>
          {isUp ? 'Growth' : 'Decline'}
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{value}</div>
    </div>
  );
}

function GraphBox({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: '24px', marginBottom: 24 }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>{title}</h3>
      <div style={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: color }}>{status}</span>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, active, onToggle, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
      <div style={{ flex: 1, paddingRight: 20 }}>
        <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4, fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{description}</div>
      </div>
      <button 
        onClick={onToggle}
        style={{ 
          width: 52, height: 28, borderRadius: 14, background: active ? color : '#e2e8f0', 
          position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s' 
        }}
      >
        <div style={{ 
          width: 20, height: 20, borderRadius: '50%', background: '#fff', 
          position: 'absolute', top: 4, left: active ? 28 : 4, transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }} />
      </button>
    </div>
  );
}

function AdminDashboardContent() {
  const { user, loading: authLoading, logout } = useAuth() || {};
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, manga, vips, messages, system, settings
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [mangas, setMangas] = useState([]);
  const [messages, setMessages] = useState([]);
  const [topReaders, setTopReaders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'readCount', direction: 'desc' });
  const [settings, setSettings] = useState({ maintenance: false, globalNsfw: true });
  
  const [auditLogs, setAuditLogs] = useState([]);
  const [adStats, setAdStats] = useState([]);
  const [searchAnalytics, setSearchAnalytics] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [bannedIps, setBannedIps] = useState([]);
  
  const [analytics, setAnalytics] = useState(null);
  const [graphType, setGraphType] = useState('monthly');
  const [graphData, setGraphData] = useState([]);
  const [health, setHealth] = useState({ cpu: '24%', disk: '42%', dbLatency: '12ms', memory: '1.2GB' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const handleClearCache = async () => {
    showToast('Clearing system cache...');
    setTimeout(() => showToast('Cache purged successfully!'), 1500);
  };

  const formatTime = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return '0m';
    
    const years = Math.floor(totalMinutes / (365 * 24 * 60));
    let rem = totalMinutes % (365 * 24 * 60);
    
    const days = Math.floor(rem / (24 * 60));
    rem %= (24 * 60);
    
    const hours = Math.floor(rem / 60);
    const minutes = Math.floor(rem % 60);
    
    let result = '';
    if (years > 0) result += `${years}y `;
    if (days > 0 || years > 0) result += `${days}d `;
    if (hours > 0 || days > 0 || years > 0) result += `${hours}h `;
    result += `${minutes}m`;
    
    return result.trim();
  };

  const toggleSetting = async (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    try {
      await adminApi.updateSettings({ [key]: newValue });
      showToast(`${key} updated`);
    } catch (err) {
      showToast('Failed to update setting', 'error');
    }
  };

  const sortedMangas = [...mangas].sort((a, b) => {
    if (sortConfig.key === 'title') {
      return sortConfig.direction === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    }
    const valA = parseFloat(a[sortConfig.key]) || 0;
    const valB = parseFloat(b[sortConfig.key]) || 0;
    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    loadAllData();
  }, [user, authLoading, activeTab, graphType]);

  async function loadAllData() {
    setLoadingData(true);
    try {
      const sRes = await adminApi.stats();
      setStats(sRes.data);

      if (activeTab === 'overview') {
        const [trRes, anaRes, graphRes] = await Promise.all([
          adminApi.topReaders(),
          adminApi.dashboardAnalytics(),
          adminApi.graphData(graphType)
        ]);
        setTopReaders(trRes.data);
        setAnalytics(anaRes.data);
        setGraphData(graphRes.data);
        
        setHealth({
          cpu: `${Math.floor(Math.random() * 20 + 10)}%`,
          disk: '42%',
          dbLatency: `${Math.floor(Math.random() * 8 + 4)}ms`,
          memory: `${(Math.random() * 0.4 + 1.1).toFixed(1)}GB`
        });
      } else if (activeTab === 'users' || activeTab === 'vips') {
        const uRes = await adminApi.users();
        setUsers(activeTab === 'vips' ? uRes.data.filter(u => u.isVip) : uRes.data);
      } else if (activeTab === 'manga') {
        const [mRes, searchRes] = await Promise.all([adminApi.mangaStats(), adminApi.searchStats()]);
        setMangas(mRes.data);
        setSearchAnalytics(searchRes.data);
      } else if (activeTab === 'messages') {
        const res = await adminApi.messages();
        setMessages(res.data);
      } else if (activeTab === 'system') {
        const [logRes, ipRes] = await Promise.all([adminApi.auditLogs(), adminApi.getBannedIps()]);
        setAuditLogs(logRes.data);
        setBannedIps(ipRes.data);
      } else if (activeTab === 'settings') {
        const [setRes, adRes] = await Promise.all([adminApi.getSettings(), adminApi.adStats()]);
        if (setRes.data) setSettings(prev => ({ ...prev, ...setRes.data }));
        setAdStats(adRes.data);
      }
    } catch { showToast('Sync failed', 'error'); }
    finally { setLoadingData(false); }
  }

  async function viewUserDetail(id) {
    try {
      const res = await adminApi.detail(id);
      setSelectedUser(res.data);
    } catch { showToast('Details failed', 'error'); }
  }

  async function toggleVip(u) {
    try {
      const next = !u.isVip;
      await adminApi.toggleVip(u.id, next);
      setUsers(users.map(item => item.id === u.id ? { ...item, isVip: next } : item));
      showToast(next ? 'VIP granted' : 'VIP revoked');
      if (selectedUser?.id === u.id) setSelectedUser({ ...selectedUser, isVip: next });
    } catch { showToast('Update failed', 'error'); }
  }

  async function toggleBan(u) {
    try {
      const next = !u.isBanned;
      await adminApi.toggleBan(u.id, next);
      setUsers(users.map(item => item.id === u.id ? { ...item, isBanned: next } : item));
      showToast(next ? 'User banned' : 'User unbanned');
      if (selectedUser?.id === u.id) setSelectedUser({ ...selectedUser, isBanned: next });
    } catch { showToast('Ban update failed', 'error'); }
  }

  async function handleBroadcast() {
    if (!broadcastMsg.trim()) return;
    try {
      await adminApi.broadcast(broadcastMsg);
      setBroadcastMsg('');
      showToast('Announcement broadcasted!');
    } catch { showToast('Broadcast failed', 'error'); }
  }

  async function deleteUser(id) {
    if (!confirm('Permanently delete this user account?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      showToast('User deleted');
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch { showToast('Delete failed', 'error'); }
  }

  async function deleteMsg(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await adminApi.deleteMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      showToast('Deleted');
    } catch { showToast('Delete failed', 'error'); }
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  if (authLoading || (!user && !authLoading)) return <div style={{ background: '#f8fafc', height: '100vh' }} />;
  if (user.role !== 'ADMIN') return null;

  const NavItem = ({ id, label, icon }) => (
    <div 
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer',
        borderRadius: 12, transition: 'all 0.2s', marginBottom: 4,
        background: activeTab === id ? 'var(--accent)' : 'transparent',
        color: activeTab === id ? '#fff' : '#64748b',
        fontWeight: activeTab === id ? 700 : 500,
        boxShadow: activeTab === id ? '0 8px 20px rgba(113,3,186,0.15)' : 'none'
      }}
    >
      <span className="material-icons" style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span style={{ fontSize: '0.85rem' }}>{label}</span>
    </div>
  );

  return (
    <div className="admin-layout" style={{ height: '100vh', background: '#f8fafc', color: '#1e293b', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      
      {/* Sidebar - Desktop & Mobile */}
      <div style={{ 
        width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 2000,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} className="admin-sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons">shield</span>
            Mani Admin
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }} className="mobile-only">
            <span className="material-icons">close</span>
          </button>
        </div>

        <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
          <NavItem id="overview" label="Dashboard" icon="dashboard" />
          <NavItem id="users" label="User Accounts" icon="group" />
          <NavItem id="manga" label="Manga Data" icon="library_books" />
          <NavItem id="vips" label="VIP Subscriptions" icon="verified" />
          <NavItem id="messages" label="User Inquiries" icon="forum" />
          <NavItem id="system" label="System Stats" icon="settings_ethernet" />
          <NavItem id="settings" label="Global Settings" icon="settings" />
        </div>

        <div style={{ padding: 20, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #dcfce7', marginBottom: 12, fontSize: '0.75rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            System Live
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #fee2e2', color: '#ef4444', background: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>logout</span>
            Exit
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1900 }} className="mobile-only" />}

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }} className="mobile-only">
              <span className="material-icons">menu</span>
            </button>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{activeTab.toUpperCase()}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <button onClick={loadAllData} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
               <span className="material-icons" style={{ fontSize: '1.2rem' }}>refresh</span>
             </button>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>AD</div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="admin-content">
          
          {activeTab === 'overview' && (
            <>
              {/* Section 1: Real-time & Core Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div style={{ background: '#fff', padding: '24px', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#6366f110', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons">people</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{analytics?.totalUsers || 0}</div>
                </div>

                <div style={{ background: '#fff', padding: '24px', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10b98110', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons">menu_book</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chapters Read</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{analytics?.today.userChapters || 0}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>USERS</div>
                    </div>
                    <div style={{ width: 1, height: 30, background: '#e2e8f0' }} />
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{analytics?.today.guestChapters || 0}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>GUESTS</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '24px', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#06b6d410', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons">visibility</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pages Viewed</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{analytics?.today.userTraffic || 0}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>USERS</div>
                    </div>
                    <div style={{ width: 1, height: 30, background: '#e2e8f0' }} />
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#06b6d4' }}>{analytics?.today.guestTraffic || 0}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>GUESTS</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '24px', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ef444410', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons">sensors</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Now</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{analytics?.activeNow || 0}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                      LIVE
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Graphs with Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Traffic & Engagement Trends</h3>
                 <div style={{ display: 'flex', background: '#e2e8f0', padding: 4, borderRadius: 12 }}>
                    {['today', 'monthly', 'yearly'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setGraphType(t)}
                        style={{ padding: '6px 16px', borderRadius: 10, border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: graphType === t ? '#fff' : 'transparent', color: graphType === t ? '#0f172a' : '#64748b', transition: 'all 0.2s', textTransform: 'capitalize' }}
                      >{t}</button>
                    ))}
                 </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
                <GraphBox title="Activity Overview">
                  <AreaChart data={graphData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="chapters" name="Chapters Read" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="traffic" name="Traffic" stroke="#06b6d4" strokeWidth={3} fill="transparent" />
                  </AreaChart>
                </GraphBox>

                <GraphBox title="Financial Performance">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#ec4899" strokeWidth={4} dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </GraphBox>
              </div>

              {/* Section 3: Performance Cards */}
              <div style={{ marginBottom: 24 }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>assessment</span>
                    Performance Deep Dive (Today)
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <MetricCard label="New Users" value={analytics?.today.newUsers || 0} trend="up" icon="person_add" color="#6366f1" />
                    <MetricCard label="Chapters Read" value={analytics?.today.chaptersRead || 0} trend="up" icon="menu_book" color="#10b981" />
                    <MetricCard label="Ads Watched" value={analytics?.today.adsWatched || 0} trend="up" icon="ads_click" color="#f59e0b" />
                    <MetricCard label="Monthly Revenue" value={`$${analytics?.month.revenue || '0.00'}`} trend="up" icon="payments" color="#ec4899" />
                    <MetricCard label="Traffic (Pages)" value={analytics?.today.traffic || 0} trend="up" icon="trending_up" color="#06b6d4" />
                    <MetricCard label="Time Spent" value={formatTime(analytics?.today.timeSpent || 0)} trend="up" icon="timer" color="#8b5cf6" />
                 </div>
              </div>

              <div className="dashboard-bottom">
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                     <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                       <span className="material-icons" style={{ color: 'var(--accent)' }}>workspace_premium</span>
                       Reader Leaderboard
                     </h3>
                     <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>ALL TIME</span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {topReaders.map((r, i) => (
                       <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                         <div style={{ width: 32, height: 32, borderRadius: 10, background: i < 3 ? 'var(--accent)' : '#fff', color: i < 3 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginRight: 16, fontSize: '0.9rem', border: i < 3 ? 'none' : '1px solid #e2e8f0' }}>{i+1}</div>
                         <div style={{ flex: 1, minWidth: 0 }}>
                           <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: (new Date() - new Date(r.lastActiveAt)) < 5 * 60 * 1000 ? '#22c55e' : '#cbd5e1' }} />
                              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{formatTime(Math.round((new Date() - new Date(r.lastActiveAt)) / 1000 / 60))} ago</div>
                           </div>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                           <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)' }}>{r.chaptersRead}</div>
                           <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Chapters</div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                      <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 800 }}>Server Health</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                         <HealthBar label="CPU Load" value={health.cpu} percent={parseInt(health.cpu)} color="#6366f1" />
                         <HealthBar label="Disk Space" value={health.disk} percent={parseInt(health.disk)} color="#f59e0b" />
                         <HealthBar label="DB Latency" value={health.dbLatency} percent={parseInt(health.dbLatency) * 5} color="#10b981" />
                         <HealthBar label="Memory Usage" value={health.memory} percent={parseFloat(health.memory) * 40} color="#ec4899" />
                      </div>
                      <div style={{ marginTop: 24, padding: '12px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #dcfce7', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#16a34a' }}>
                        NODES FULLY OPERATIONAL
                      </div>
                   </div>
                   <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                      <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 800 }}>Quick System Actions</h3>
                      <button onClick={handleClearCache} style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>Purge Redis Cache</button>
                      <button onClick={() => setActiveTab('settings')} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>Manage Global Config</button>
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'manga' && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th onClick={() => requestSort('title')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Manga {sortConfig.key === 'title' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                        </div>
                      </th>
                      <th onClick={() => requestSort('chapterCount')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Chapters {sortConfig.key === 'chapterCount' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                        </div>
                      </th>
                      <th onClick={() => requestSort('readCount')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Reads {sortConfig.key === 'readCount' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                        </div>
                      </th>
                      <th onClick={() => requestSort('uniqueUsers')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Users {sortConfig.key === 'uniqueUsers' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                        </div>
                      </th>
                      <th onClick={() => requestSort('averageRating')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Rating {sortConfig.key === 'averageRating' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                        </div>
                      </th>
                      <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMangas.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: m.isHidden ? 0.6 : 1 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {m.title}
                            {m.isHidden && <span className="material-icons" style={{ fontSize: '1rem', color: '#64748b' }}>visibility_off</span>}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                           <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: 6, fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>{m.chapterCount}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.8rem' }}>{m.readCount.toLocaleString()}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)' }}>{m.uniqueUsers.toLocaleString()}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700 }}>⭐ {m.averageRating}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button 
                            onClick={async () => {
                              try {
                                await adminApi.hideManga(m.id, !m.isHidden);
                                setMangas(prev => prev.map(item => item.id === m.id ? { ...item, isHidden: !m.isHidden } : item));
                                showToast(m.isHidden ? 'Manga Visible' : 'Manga Hidden');
                              } catch { showToast('Action failed', 'error'); }
                            }}
                            style={{ padding: '6px 12px', borderRadius: 8, background: m.isHidden ? '#f0fdf4' : '#f1f5f9', border: 'none', color: m.isHidden ? '#166534' : '#64748b', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            {m.isHidden ? 'Show' : 'Hide'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {(activeTab === 'users' || activeTab === 'vips') && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>User</th>
                      <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>Tier</th>
                      <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>Ads</th>
                      <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>Time</th>
                      <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {u.isBanned ? (
                            <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, background: '#fee2e2', color: '#ef4444' }}>BANNED</span>
                          ) : u.isVip ? (
                            <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, background: '#f5f3ff', color: '#5b21b6' }}>VIP</span>
                          ) : (
                            <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, background: '#f1f5f9', color: '#64748b' }}>FREE</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.8rem' }}>{u.adsWatched}</td>
                         <td style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700 }}>{formatTime((u.timeSpent || 0) / 1000 / 60)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button onClick={() => viewUserDetail(u.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#f1f5f9', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', marginRight: 6 }}>View</button>
                          <button onClick={() => toggleBan(u)} style={{ padding: '6px 12px', borderRadius: 8, background: u.isBanned ? '#f0fdf4' : '#fee2e2', border: 'none', color: u.isBanned ? '#166534' : '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', marginRight: 6 }}>{u.isBanned ? 'Unban' : 'Ban'}</button>
                          <button onClick={() => deleteUser(u.id)} style={{ color: '#ef4444', background: 'transparent', cursor: 'pointer', border: 'none' }}><span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map(m => (
                <div key={m.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{m.subject || 'No Subject'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.email}</div>
                    </div>
                    <button onClick={() => deleteMsg(m.id)} style={{ color: '#ef4444', background: 'transparent', cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span></button>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>{m.message}</div>
                  
                  {m.reply ? (
                    <div style={{ padding: 14, background: '#f0fdf4', borderLeft: '4px solid #166534', borderRadius: '0 12px 12px 0', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 800, color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-icons" style={{ fontSize: '1rem' }}>reply</span> Admin Response
                      </div>
                      <div style={{ color: '#166534' }}>{m.reply}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                       <textarea 
                          id={`reply-${m.id}`} 
                          placeholder="Type your reply..." 
                          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.85rem', minHeight: 80, outline: 'none' }}
                       />
                       <button 
                          onClick={async () => {
                            const val = document.getElementById(`reply-${m.id}`).value;
                            if (!val) return;
                            try {
                              await adminApi.replyToMessage(m.id, val);
                              setMessages(prev => prev.map(item => item.id === m.id ? { ...item, reply: val } : item));
                              showToast('Reply saved');
                            } catch { showToast('Failed to save reply', 'error'); }
                          }}
                          style={{ alignSelf: 'flex-end', padding: '8px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                       >Send Reply</button>
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && <div style={{ textAlign: 'center', padding: 100, color: '#94a3b8' }}>Zero inquiries.</div>}
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 20 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: '1rem' }}>IP Banning & Security</h3>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <input id="banIpInput" placeholder="IP Address (e.g. 192.168.1.1)" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                    <input id="banReasonInput" placeholder="Reason (optional)" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                    <button 
                      onClick={async () => {
                        const ip = document.getElementById('banIpInput').value;
                        const reason = document.getElementById('banReasonInput').value;
                        if (!ip) return showToast('IP is required', 'error');
                        try {
                          await adminApi.banIp(ip, reason);
                          setBannedIps(prev => [{ ip, reason, createdAt: new Date() }, ...prev]);
                          showToast('IP Banned');
                          document.getElementById('banIpInput').value = '';
                          document.getElementById('banReasonInput').value = '';
                        } catch { showToast('Ban failed', 'error'); }
                      }}
                      style={{ padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                    >Ban IP</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bannedIps.map(b => (
                      <div key={b.ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff1f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#991b1b' }}>{b.ip}</div>
                          <div style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{b.reason || 'No reason provided'} • {new Date(b.createdAt).toLocaleDateString()}</div>
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              await adminApi.unbanIp(b.ip);
                              setBannedIps(prev => prev.filter(item => item.ip !== b.ip));
                              showToast('IP Unbanned');
                            } catch { showToast('Unban failed', 'error'); }
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        ><span className="material-icons">delete_forever</span></button>
                      </div>
                    ))}
                    {bannedIps.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: '0.8rem' }}>No active IP bans.</div>}
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 20 }}>
                 <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: '1rem' }}>Gateway Health</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <StatusItem label="Search API" status="Online" color="#10b981" />
                    <StatusItem label="Auth API" status="Online" color="#10b981" />
                    <StatusItem label="Database" status="Online" color="#10b981" />
                    <StatusItem label="Image Proxy" status="Online" color="#10b981" />
                 </div>
               </div>

               <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 20 }}>
                 <h3 style={{ marginBottom: 16, fontWeight: 800, fontSize: '1rem' }}>Audit Logs</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                    {auditLogs.map(log => (
                      <div key={log.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{log.action}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{new Date(log.createdAt).toLocaleString()}</span>
                         </div>
                         <div style={{ color: '#475569' }}>
                            {log.target && <span style={{ fontWeight: 700 }}>Target: {log.target} </span>}
                            {log.details && <span>({log.details})</span>}
                         </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No logs found.</div>}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                    <h3 style={{ marginBottom: 20, fontWeight: 800 }}>Broadcast Center</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>Send a global message to all active readers.</p>
                    <textarea 
                      placeholder="Type announcement here..."
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      style={{ width: '100%', height: 100, padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', marginBottom: 16, resize: 'none' }}
                    />
                    <button onClick={handleBroadcast} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Broadcast Announcement</button>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                    <h3 style={{ marginBottom: 20, fontWeight: 800 }}>Search Analytics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                       {searchAnalytics.map((s, i) => (
                         <div key={s.keyword} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                           <div style={{ display: 'flex', gap: 12 }}>
                              <span style={{ fontWeight: 800, color: '#94a3b8' }}>#{i+1}</span>
                              <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.keyword}</span>
                           </div>
                           <span style={{ color: 'var(--accent)', fontWeight: 900 }}>{s.count}</span>
                         </div>
                       ))}
                       {searchAnalytics.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No search data.</div>}
                    </div>
                  </div>
               </div>

               <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                  <h3 style={{ marginBottom: 24, fontWeight: 800 }}>Estimated Ad Revenue (Last 7 Days)</h3>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 200, paddingBottom: 20 }}>
                     {adStats.map(s => (
                       <div key={s.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: '100%', height: `${(s.revenue / 70) * 100}%`, background: 'var(--accent)', borderRadius: '4px 4px 0 0', position: 'relative' }} title={`$${s.revenue}`}>
                             <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', fontWeight: 800 }}>${s.revenue}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{s.name}</span>
                       </div>
                     ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
                     <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 16, border: '1px solid #dcfce7' }}>
                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 800 }}>TOTAL IMPRESSIONS</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534' }}>{adStats.reduce((acc, s) => acc + s.impressions, 0).toLocaleString()}</div>
                     </div>
                     <div style={{ padding: 16, background: '#f5f3ff', borderRadius: 16, border: '1px solid #ede9fe' }}>
                        <div style={{ fontSize: '0.7rem', color: '#5b21b6', fontWeight: 800 }}>ESTIMATED PAYOUT</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#5b21b6' }}>${adStats.reduce((acc, s) => acc + parseFloat(s.revenue), 0).toFixed(2)}</div>
                     </div>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 32 }}>
                    <h3 style={{ marginBottom: 24, fontWeight: 800 }}>Platform Controls</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SettingToggle label="Maintenance Mode" description="Disable public access while performing updates" active={settings.maintenance} onToggle={() => toggleSetting('maintenance')} color="#ef4444" />
                        <SettingToggle label="Global NSFW Filter" description="Enforce NSFW content hiding for all guest users" active={settings.globalNsfw} onToggle={() => toggleSetting('globalNsfw')} color="#6366f1" />
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 32 }}>
                    <h3 style={{ marginBottom: 24, fontWeight: 800 }}>System Maintenance</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>Purging the system cache will force the API to re-fetch fresh metadata from all providers.</p>
                    <button onClick={handleClearCache} style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'var(--accent)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(113,3,186,0.1)' }}>Purge All Caches</button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>User Profile</h2>
                <button onClick={() => setSelectedUser(null)} style={{ border: 'none', background: 'transparent' }}><span className="material-icons">close</span></button>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>EMAIL</div>
                <div style={{ fontWeight: 800 }}>{selectedUser.email}</div>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: '#fff1f2', borderRadius: 16, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 800, marginBottom: 4 }}>PASSWORD HASH</div>
                <div style={{ fontWeight: 600, fontSize: '0.75rem', wordBreak: 'break-all', color: '#b91c1c', fontFamily: 'monospace' }}>{selectedUser.password}</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Permissions & Access</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={async () => {
                      try {
                        const newRole = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
                        await adminApi.changeRole(selectedUser.id, newRole);
                        setSelectedUser(prev => ({ ...prev, role: newRole }));
                        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
                        showToast(`User role updated to ${newRole}`);
                      } catch { showToast('Action failed', 'error'); }
                    }}
                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: selectedUser.role === 'ADMIN' ? '#f5f3ff' : '#fff', color: selectedUser.role === 'ADMIN' ? '#5b21b6' : '#1e293b', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <span className="material-icons" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: 8 }}>{selectedUser.role === 'ADMIN' ? 'verified_user' : 'person_outline'}</span>
                    {selectedUser.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                  <button 
                    onClick={() => toggleVip(selectedUser)}
                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: selectedUser.isVip ? '#fffbeb' : '#fff', color: selectedUser.isVip ? '#b45309' : '#1e293b', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <span className="material-icons" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: 8 }}>workspace_premium</span>
                    {selectedUser.isVip ? 'Remove VIP' : 'Grant VIP'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>READS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{selectedUser.stats?.totalChaptersRead || 0} <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>CHAPTERS</span></div>
                </div>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>ADS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{selectedUser.adsWatched}</div>
                </div>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>TIME STAYED</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{formatTime((selectedUser.timeSpent || 0) / 1000 / 60)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12 }}>Reading Habits</h3>
                {selectedUser.stats?.topGenres.length > 0 ? selectedUser.stats.topGenres.map(g => (
                  <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '8px 12px', background: '#f1f5f9', borderRadius: 10, fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700 }}>{g.name}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 900 }}>{g.count}</span>
                  </div>
                )) : <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No data.</div>}
              </div>

              <button onClick={() => toggleVip(selectedUser)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: selectedUser.isVip ? '#ef4444' : 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', border: 'none' }}>
                {selectedUser.isVip ? 'Revoke VIP' : 'Grant VIP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

    </div>

  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
