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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

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

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
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

            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }} suppressHydrationWarning>
                {!mounted ? (
                  <button className="btn btn-ghost btn-sm" style={{ visibility: 'hidden', width: '120px' }}>Loading...</button>
                ) : (
                  user ? (
                    <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
                  ) : (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={openLogin}>Login</button>
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
                <span className="material-icons" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-3)' }}>search</span>
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
