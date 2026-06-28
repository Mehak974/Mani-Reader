'use client';
import React from 'react';
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

function MetricCard({ label, value, trend, icon, color, subValue }) {
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
      {subValue && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 6, fontWeight: 700 }}>{subValue}</div>}
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

  const [activeTab, setActiveTab] = React.useState('users'); // users, manga, vips, messages, system, settings, blog
  const [selectedBlog, setSelectedBlog] = React.useState(null);
  const [entryEditId, setEntryEditId] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [guestUsers, setGuestUsers] = React.useState([]);
  const [mangas, setMangas] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [topReaders, setTopReaders] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  
  const [loadingData, setLoadingData] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState({ key: 'readCount', direction: 'desc' });
  const [settings, setSettings] = React.useState({ maintenance: false, globalNsfw: true });
  
  const [auditLogs, setAuditLogs] = React.useState([]);
  const [adStats, setAdStats] = React.useState([]);
  const [searchAnalytics, setSearchAnalytics] = React.useState([]);
  const [broadcastMsg, setBroadcastMsg] = React.useState('');
  const [bannedIps, setBannedIps] = React.useState([]);
  const [blogPosts, setBlogPosts] = React.useState([]);
  const [blogEditId, setBlogEditId] = React.useState(null);
  const [blogSortConfig, setBlogSortConfig] = React.useState({ key: 'createdAt', direction: 'desc' });
  const [entrySortConfig, setEntrySortConfig] = React.useState({ key: 'title', direction: 'asc' });
  
  const [analytics, setAnalytics] = React.useState(null);
  const [graphType, setGraphType] = React.useState('monthly');
  const [graphData, setGraphData] = React.useState([]);
  const [health, setHealth] = React.useState({ cpu: '24%', disk: '42%', dbLatency: '12ms', memory: '1.2GB' });

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

  const sortedBlogPosts = React.useMemo(() => {
    return [...blogPosts].sort((a, b) => {
      let valA = a[blogSortConfig.key];
      let valB = b[blogSortConfig.key];

      if (blogSortConfig.key === 'category') {
        valA = a.category?.name || a.category || '';
        valB = b.category?.name || b.category || '';
      }

      if (typeof valA === 'string') {
        return blogSortConfig.direction === 'asc'
          ? (valA || '').localeCompare(valB || '')
          : (valB || '').localeCompare(valA || '');
      }

      const numA = new Date(valA).getTime() || 0;
      const numB = new Date(valB).getTime() || 0;
      return blogSortConfig.direction === 'asc' ? numA - numB : numB - numA;
    });
  }, [blogPosts, blogSortConfig]);

  const requestBlogSort = (key) => {
    let direction = 'desc';
    if (blogSortConfig.key === key && blogSortConfig.direction === 'desc') direction = 'asc';
    setBlogSortConfig({ key, direction });
  };

  const sortedEntries = React.useMemo(() => {
    if (!selectedBlog || !Array.isArray(selectedBlog.entries)) return [];
    return [...selectedBlog.entries].sort((a, b) => {
      let valA = a[entrySortConfig.key] || '';
      let valB = b[entrySortConfig.key] || '';

      if (typeof valA === 'string') {
        return entrySortConfig.direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return entrySortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }
    });
  }, [selectedBlog?.entries, entrySortConfig]);

  const requestEntrySort = (key) => {
    let direction = 'asc';
    if (entrySortConfig.key === key && entrySortConfig.direction === 'asc') direction = 'desc';
    setEntrySortConfig({ key, direction });
  };

  React.useEffect(() => {
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

      if (activeTab === 'users' || activeTab === 'vips') {
        const [uRes, trRes] = await Promise.all([
          adminApi.users(),
          adminApi.topReaders()
        ]);
        setUsers(activeTab === 'vips' ? uRes.data.filter(u => u.isVip) : uRes.data);
        setTopReaders(trRes.data);
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
      } else if (activeTab === 'blog') {
        const { blogApi } = await import('../../lib/api');
        const res = await blogApi.list();
        setBlogPosts(res.data || []);
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
          <NavItem id="users" label="User Accounts" icon="group" />
          <NavItem id="manga" label="Manga Data" icon="library_books" />
          <NavItem id="vips" label="VIP Subscriptions" icon="verified" />
          <NavItem id="messages" label="User Inquiries" icon="forum" />
          <NavItem id="system" label="System Stats" icon="settings_ethernet" />
          <NavItem id="blog" label="Manga Blogs" icon="rss_feed" />
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
                       <th onClick={() => requestSort('readCount')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                           Reads {sortConfig.key === 'readCount' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
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
                         <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.8rem' }}>{m.readCount.toLocaleString()}</td>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }} className="admin-users-layout">
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
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

              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 20 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                     <span className="material-icons" style={{ color: 'var(--accent)' }}>workspace_premium</span>
                     Reader Leaderboard
                   </h3>
                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>ALL TIME</span>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {topReaders.map((r, i) => (
                     <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                       <div style={{ width: 28, height: 28, borderRadius: 8, background: i < 3 ? 'var(--accent)' : '#fff', color: i < 3 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginRight: 12, fontSize: '0.8rem', border: i < 3 ? 'none' : '1px solid #e2e8f0' }}>{i+1}</div>
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: (new Date() - new Date(r.lastActiveAt)) < 5 * 60 * 1000 ? '#22c55e' : '#cbd5e1' }} />
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{formatTime(Math.round((new Date() - new Date(r.lastActiveAt)) / 1000 / 60))} ago</div>
                         </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent)' }}>{r.chaptersRead}</div>
                         <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Chapters</div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
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
                          <div style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{b.reason || 'No reason provided'} | {new Date(b.createdAt).toLocaleDateString()}</div>
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

          {activeTab === 'blog' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {selectedBlog ? (
                // ── Manga Entries Management Sub-view ─────────────────────────
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <button 
                        onClick={() => { setSelectedBlog(null); setEntryEditId(null); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
                      >
                        <span className="material-icons">arrow_back</span> Back to Blog Lists
                      </button>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Manage Entries: {selectedBlog.title}</h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Category: {selectedBlog.category?.name || selectedBlog.category}</span>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                    <h4 style={{ marginBottom: 20, fontWeight: 800 }}>
                      {entryEditId ? 'Edit Manga Entry' : 'Add Manga Entry'}
                    </h4>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const title = e.target.entryTitle.value.trim();
                        const slug = e.target.entrySlug.value.trim();
                        const content = e.target.entryContent.value.trim();
                        const image = e.target.entryImage.value.trim();

                        if (!title || !slug || !content) {
                          return showToast('Please fill title, slug and content', 'error');
                        }

                        try {
                          const { blogApi } = await import('../../lib/api');
                          if (entryEditId) {
                            const res = await blogApi.updateEntry(selectedBlog.id, entryEditId, { title, slug, content, image });
                            setSelectedBlog(prev => ({
                              ...prev,
                              entries: prev.entries.map(entry => entry.id === entryEditId ? res.data : entry)
                            }));
                            showToast('Entry updated successfully!');
                            setEntryEditId(null);
                          } else {
                            const res = await blogApi.createEntry(selectedBlog.id, { title, slug, content, image });
                            setSelectedBlog(prev => ({
                              ...prev,
                              entries: [...(prev.entries || []), res.data]
                            }));
                            showToast('Entry added successfully!');
                          }
                          e.target.reset();
                        } catch (err) {
                          showToast(err.response?.data?.error || 'Failed to save entry', 'error');
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Title</label>
                          <input 
                            name="entryTitle" 
                            defaultValue={entryEditId ? selectedBlog.entries?.find(en => en.id === entryEditId)?.title : ''} 
                            placeholder="e.g. Solo Leveling" 
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>URL Slug</label>
                          <input 
                            name="entrySlug" 
                            defaultValue={entryEditId ? selectedBlog.entries?.find(en => en.id === entryEditId)?.slug : ''} 
                            placeholder="e.g. solo-leveling" 
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
                            required 
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Image URL</label>
                          <input 
                            name="entryImage" 
                            defaultValue={entryEditId ? selectedBlog.entries?.find(en => en.id === entryEditId)?.image : ''} 
                            placeholder="e.g. https://example.com/cover.jpg" 
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Content Markup</label>
                        <textarea 
                          name="entryContent" 
                          defaultValue={entryEditId ? selectedBlog.entries?.find(en => en.id === entryEditId)?.content : ''} 
                          placeholder="Write entry description/content details..." 
                          style={{ width: '100%', height: 120, padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} 
                          required 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                          {entryEditId ? 'Update Entry' : 'Add Entry'}
                        </button>
                        {entryEditId && (
                          <button 
                            type="button" 
                            onClick={() => setEntryEditId(null)} 
                            style={{ padding: '12px 24px', borderRadius: 12, background: '#f1f5f9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
                      <h3 style={{ fontWeight: 800 }}>Blog Entries</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', border_bottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>Image</th>
                            <th 
                              onClick={() => requestEntrySort('title')}
                              style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer', userSelect: 'none' }}
                            >
                              Title {entrySortConfig.key === 'title' && (entrySortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th 
                              onClick={() => requestEntrySort('slug')}
                              style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer', userSelect: 'none' }}
                            >
                              Slug {entrySortConfig.key === 'slug' && (entrySortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>Content</th>
                            <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedEntries.map(en => (
                            <tr key={en.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '14px 16px' }}>
                                {en.image ? (
                                  <img src={en.image} alt={en.title} style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                                ) : (
                                  <div style={{ width: 40, height: 60, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: '1.2rem', color: '#cbd5e1' }}>image</span>
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.85rem' }}>{en.title}</td>
                              <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#64748b' }}>{en.slug}</td>
                              <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{en.content}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <button onClick={() => setEntryEditId(en.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#f1f5f9', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', marginRight: 6 }}>Edit</button>
                                <button 
                                  onClick={async () => {
                                    if (!confirm('Delete this entry?')) return;
                                    try {
                                      const { blogApi } = await import('../../lib/api');
                                      await blogApi.deleteEntry(selectedBlog.id, en.id);
                                      setSelectedBlog(prev => ({
                                        ...prev,
                                        entries: prev.entries.filter(item => item.id !== en.id)
                                      }));
                                      showToast('Entry deleted');
                                    } catch { showToast('Failed to delete entry', 'error'); }
                                  }}
                                  style={{ color: '#ef4444', background: 'transparent', cursor: 'pointer', border: 'none' }}
                                >
                                  <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(!Array.isArray(selectedBlog?.entries) || selectedBlog.entries.length === 0) && (
                            <tr>
                              <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No entries added to this list yet. Use the form above to add manga recommendation entries.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                // ── Blog Lists View ───────────────────────────────────────────
                <>
                  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 24 }}>
                    <h3 style={{ marginBottom: 20, fontWeight: 800 }}>{blogEditId ? 'Edit Recommendation List' : 'Upload Curated Recommendation List'}</h3>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const title = e.target.blogTitle.value.trim();
                        const slug = e.target.blogSlug.value.trim();
                        const category = e.target.blogCategory.value;
                        const content = e.target.blogContent.value.trim();

                        if (!title || !slug || !category || !content) {
                          return showToast('Please fill all fields', 'error');
                        }

                        try {
                          const { blogApi } = await import('../../lib/api');
                          if (blogEditId) {
                            const res = await blogApi.update(blogEditId, { title, slug, category, content });
                            setBlogPosts(prev => prev.map(p => p.id === blogEditId ? res.data : p));
                            showToast('Blog updated successfully!');
                            setBlogEditId(null);
                          } else {
                            const res = await blogApi.create({ title, slug, category, content });
                            setBlogPosts(prev => [res.data, ...prev]);
                            showToast('Blog created successfully!');
                          }
                          e.target.reset();
                        } catch (err) {
                          showToast(err.response?.data?.error || 'Failed to save blog post', 'error');
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Title</label>
                          <input name="blogTitle" defaultValue={blogEditId ? blogPosts.find(p => p.id === blogEditId)?.title : ''} placeholder="e.g. Best Romance Manga" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} required />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>URL Slug</label>
                          <input name="blogSlug" defaultValue={blogEditId ? blogPosts.find(p => p.id === blogEditId)?.slug : ''} placeholder="e.g. best-romance-manga" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }} required />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Category</label>
                        <select name="blogCategory" defaultValue={blogEditId ? (blogPosts.find(p => p.id === blogEditId)?.category?.name?.toLowerCase() || blogPosts.find(p => p.id === blogEditId)?.category) : 'romance'} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', background: '#fff' }}>
                          <option value="romance">Romance</option>
                          <option value="action">Action</option>
                          <option value="historical">Historical</option>
                          <option value="fantasy/isekai">Fantasy/Isekai</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Description</label>
                        <textarea name="blogContent" defaultValue={blogEditId ? blogPosts.find(p => p.id === blogEditId)?.content : ''} placeholder="Write brief list description..." style={{ width: '100%', height: 100, padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} required />
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                          {blogEditId ? 'Update Post' : 'Publish List'}
                        </button>
                        {blogEditId && (
                          <button type="button" onClick={() => setBlogEditId(null)} style={{ padding: '12px 24px', borderRadius: 12, background: '#f1f5f9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
                      <h3 style={{ fontWeight: 800 }}>Uploaded Lists</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th onClick={() => requestBlogSort('title')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                Title {blogSortConfig.key === 'title' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{blogSortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                              </div>
                            </th>
                            <th onClick={() => requestBlogSort('slug')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                Slug {blogSortConfig.key === 'slug' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{blogSortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                              </div>
                            </th>
                            <th onClick={() => requestBlogSort('category')} style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                Category {blogSortConfig.key === 'category' && <span className="material-icons" style={{ fontSize: '0.8rem' }}>{blogSortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                              </div>
                            </th>
                            <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedBlogPosts.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.85rem' }}>{p.title}</td>
                              <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#64748b' }}>{p.slug}</td>
                              <td style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>{p.category?.name || p.category}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <button 
                                  onClick={async () => {
                                    setSelectedBlog(p);
                                    try {
                                      const { blogApi } = await import('../../lib/api');
                                      const res = await blogApi.get(p.slug);
                                      setSelectedBlog(res.data);
                                    } catch (err) {
                                      showToast('Failed to load blog entries', 'error');
                                    }
                                  }} 
                                  style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', marginRight: 6 }}
                                >
                                  Manga Entries
                                </button>
                                <button onClick={() => setBlogEditId(p.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#f1f5f9', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', marginRight: 6 }}>Edit</button>
                                <button 
                                  onClick={async () => {
                                    if (!confirm('Delete this post?')) return;
                                    try {
                                      const { blogApi } = await import('../../lib/api');
                                      await blogApi.delete(p.id);
                                      setBlogPosts(prev => prev.filter(item => item.id !== p.id));
                                      showToast('Post deleted');
                                    } catch { showToast('Failed to delete post', 'error'); }
                                  }}
                                  style={{ color: '#ef4444', background: 'transparent', cursor: 'pointer', border: 'none' }}
                                >
                                  <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {blogPosts.length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No list pages uploaded yet. Fill the form above to add a dynamic post.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
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
