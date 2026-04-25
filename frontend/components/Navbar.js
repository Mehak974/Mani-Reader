'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import Sidebar from './Sidebar';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth() || {};
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && user.role === 'ADMIN' && !pathname.startsWith('/admin')) {
      router.push('/admin');
    }
  }, [user, pathname, router]);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse' },
    { href: '/library', label: 'Bookmarks' },
    { href: '/collections', label: 'Collections' },
    { href: '/history', label: 'History' },
  ];

  if (user && user.role === 'ADMIN') {
    links.push({ href: '/admin', label: 'Admin Panel' });
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner" style={{ position: 'relative' }}>
          {/* Desktop Layout */}
          <div className="desktop-nav-content" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <Link href="/" className="navbar-logo">
              <img src="/logo.png?v=1.2" alt="Mani Reader" className="logo-desktop" />
            </Link>

            <div className="navbar-links" style={{
              display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center'
            }}>
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={`navbar-link ${pathname === href ? 'active' : ''}`}>{label}</Link>
              ))}
            </div>

            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {user ? (
                <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-ghost btn-sm">Login</Link>
                  <Link href="/auth/register" className="btn jewel-btn btn-sm">Sign Up</Link>
                </>
              )}
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'transparent', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)', padding: '0 8px' }}
              >
                <span className="material-icons" style={{ fontSize: '2.2rem' }}>menu</span>
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="mobile-nav-content" style={{ display: 'none', flexDirection: 'column', width: '100%' }}>
            {/* Line 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
              <Link href="/" style={{ flexShrink: 0 }}>
                <img src="/icon.png?v=1.2" alt="Mani Reader" style={{ height: 40, width: 40, borderRadius: 8, objectFit: 'cover' }} />
              </Link>
              
              <div style={{ flex: 1, margin: '0 12px', position: 'relative', maxWidth: '70%', marginLeft: 'auto', marginRight: 'auto' }}>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  style={{ 
                    width: '100%', padding: '8px 12px 8px 32px', borderRadius: 20, 
                    background: 'var(--surface-2)', border: '1px solid var(--border)', 
                    color: 'var(--text)', fontSize: '0.85rem', outline: 'none' 
                  }} 
                />
                <span className="material-icons" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-3)' }}>search</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {user && (
                  <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--red)', display: 'flex', alignItems: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '1.5rem' }}>logout</span>
                  </button>
                )}
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                  <span className="material-icons" style={{ fontSize: '1.8rem' }}>menu</span>
                </button>
              </div>
            </div>
            
            {/* Line 2: Horizontal Menu */}
            <div style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 4, scrollbarWidth: 'none', whiteSpace: 'nowrap' }}>
              {links.map(({ href, label }) => (
                <Link key={href} href={href} style={{ fontSize: '0.85rem', fontWeight: 600, color: pathname === href ? 'var(--accent)' : 'var(--text-2)' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav-content { display: none !important; }
          .mobile-nav-content { display: flex !important; }
          .navbar { padding: 10px 0 16px 0; height: auto; }
        }
      `}</style>
    </>
  );
}
