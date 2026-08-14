'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { useModals } from '../context/ModalContext';
import Sidebar from './Sidebar';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth() || {};
  const { openLogin, openRegister } = useModals();
  const [scrolled, setScrolled] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  const triggerSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  // ⚡ Live search: trigger search as the user types (with 300ms debounce)
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q) {
      const delayDebounce = setTimeout(() => {
        router.push(`/browse?q=${encodeURIComponent(q)}`);
      }, 600);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse' },
    { href: '/library', label: 'Bookmarks' },
    { href: '/collections', label: 'Collections' },
    { href: '/history', label: 'History' },
  ];

  if (mounted && user && user.role === 'ADMIN') {
    links.push({ href: '/admin', label: 'Admin Panel' });
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{
        background: scrolled ? 'rgba(7, 7, 10, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div className="navbar-inner" style={{ position: 'relative' }}>
          {/* Desktop Layout */}
          <div className="desktop-nav-content" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)', padding: '0 8px', marginRight: '16px' }}
            >
              <span className="material-icons" style={{ fontSize: '2.2rem' }}>menu</span>
            </button>

            <Link href="/" className="navbar-logo">
              <Image
                src="/logo.png"
                alt="Mani Reader"
                width={180}
                height={40}
                className="logo-desktop"
                priority
              />
            </Link>

            <div className="navbar-links notranslate" style={{
              display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center'
            }}>
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={`navbar-link ${pathname === href ? 'active' : ''}`}>{label}</Link>
              ))}
            </div>

            {/* Desktop Search */}
            <div className="desktop-search-wrap" style={{ position: 'relative', marginRight: '16px', width: '240px' }}>
              <input
                type="text"
                placeholder="Search manga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                style={{
                  width: '100%', padding: '10px 14px 10px 40px', borderRadius: 24,
                  background: 'rgba(16, 16, 24, 0.8)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                  transition: 'all 0.3s', backdropFilter: 'blur(12px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent)';
                  e.target.style.boxShadow = '0 0 0 3px var(--accent-glow), 0 0 20px var(--accent-glow)';
                  e.target.style.background = 'rgba(16, 16, 24, 0.95)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(16, 16, 24, 0.8)';
                }}
              />
              <span className="material-icons" onClick={triggerSearch} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--text-3)', cursor: 'pointer', zIndex: 10, transition: 'color 0.2s' }}>search</span>
            </div>

            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }} suppressHydrationWarning>
                {!mounted ? (
                  <button className="btn btn-ghost btn-sm" style={{ visibility: 'hidden', width: '120px' }}>Loading...</button>
                ) : (
                  user ? (
                    <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(16, 16, 24, 0.8)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }} onClick={logout}>Logout</button>
                  ) : (
                    <>
                      <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(16, 16, 24, 0.8)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }} onClick={openLogin}>Login</button>
                      <button className="btn jewel-btn btn-sm" onClick={openRegister}>Sign Up</button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="mobile-nav-content" style={{ display: 'none', flexDirection: 'column', width: '100%' }}>
            {/* Line 1 */}
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '8px', gap: 12 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                <span className="material-icons" style={{ fontSize: '1.8rem' }}>menu</span>
              </button>

              <Link href="/" style={{ flexShrink: 0 }}>
                <Image
                  src="/icon.png"
                  alt="Mani Reader"
                  width={40}
                  height={40}
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
              </Link>

              <div style={{ flex: 1, position: 'relative' }}>
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
                <span className="material-icons" onClick={triggerSearch} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-3)', cursor: 'pointer', zIndex: 10 }}>search</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center' }} suppressHydrationWarning>
                  {mounted && user ? (
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--red)', display: 'flex', alignItems: 'center' }}>
                      <span className="material-icons" style={{ fontSize: '1.5rem' }}>logout</span>
                    </button>
                  ) : (
                    !mounted && <button style={{ visibility: 'hidden', width: '24px' }}>...</button>
                  )}
                </div>
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
