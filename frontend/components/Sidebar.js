'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { useModals } from '../context/ModalContext';

// ── Sidebar sections ──────────────────────────────────────────────────────────
const MAIN_LINKS = [
  { href: '/',                icon: 'home',          label: 'Home' },
  { href: '/post-manga',      icon: 'add_to_photos', label: 'Post Manga', goal: true },
  { href: '/settings',        icon: 'settings',      label: 'Settings' },
];

const BLOG_LINKS = [
  { href: '/blog/category/romance',            icon: 'favorite',      label: 'Romance Blogs' },
  { href: '/blog/category/action',             icon: 'whatshot',      label: 'Action Blogs' },
  { href: '/blog/category/isekai',             icon: 'auto_awesome',  label: 'Isekai & Fantasy' },
  { href: '/blog/category/historical',         icon: 'history_edu',   label: 'Historical Blogs' },
];

const SOCIAL_LINKS = [
  { href: 'https://discord.gg/XScjzUBtF', icon: 'forum', label: 'Discord', color: '#5865F2' },
  { href: 'https://reddit.com/r/manireader', icon: 'reddit', label: 'Reddit', color: '#FF4500' },
];

const INFO_LINKS = [
  { href: '/about',      icon: 'info',                  label: 'About Us' },
  { href: '/support',    icon: 'volunteer_activism',    label: 'Support Us' },
  { href: '/contact',    icon: 'mail',                  label: 'Contact Us' },
  { href: '/faq',        icon: 'contact_support',       label: 'Common Questions' },
];

const POLICY_LINKS = [
  { href: '/privacy',    icon: 'security',              label: 'Privacy Policy' },
  { href: '/terms',      icon: 'description',           label: 'Terms of Service' },
  { href: '/disclaimer', icon: 'gavel',                 label: 'Legal Disclaimer' },
];

const GOAL_DATA = {
  current: 45,
  target: 1500,
  label: 'Manga Posting System'
};

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SidebarItem({ href, icon, label, active, external, onClick, goal }) {
  const content = (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderRadius: 10,
        color: active ? 'var(--text)' : 'var(--text-2)',
        background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        fontSize: '0.875rem', fontWeight: active ? 600 : 400,
        cursor: 'pointer', transition: 'all 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="material-icons" style={{ fontSize: '1.2rem', opacity: active ? 1 : 0.7 }}>{icon}</span>
        {label}
      </div>
      {goal && (
        <span style={{ fontSize: '0.65rem', background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: 6, fontWeight: 800 }}>GOAL</span>
      )}
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>{content}</a>;
  }

  if (href === '/support') {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link href={href} onClick={onClick}>{content}</Link>;
}

// ── Sidebar Component ─────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {

  const pathname  = usePathname();
  const { user, logout } = useAuth() || {};
  const { openLogin, openRegister, openSupport } = useModals();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => { 
    logout?.(); 
    onClose?.(); 
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Sidebar Panel */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 160,
        width: 280,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isOpen ? '4px 0 40px rgba(0,0,0,0.6)' : 'none',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <Link href="/" onClick={onClose} style={{
            fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
 WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Mani Reader
          </Link>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-2)',
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>close</span>
          </button>
        </div>

        {/* User Info */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: '#fff',
          }}>
            {user ? user.email?.[0]?.toUpperCase() : '?'}
          </div>
          <div>
            {user ? (
              <>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                  {user.username || user.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{user.email}</div>
              </>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
                <button onClick={() => { openLogin?.(); onClose?.(); }} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Login</button>
                {' or '}
                <button onClick={() => { openRegister?.(); onClose?.(); }} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Sign Up</button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

          {/* Main */}
          <div style={{ padding: '8px 0' }}>
            {MAIN_LINKS.map(item => (
              <SidebarItem
                key={item.href + item.label}
                {...item}
                active={pathname === item.href}
                onClick={() => {
                  if (item.label === 'Support Us' || item.href === '/support') {
                    openSupport?.();
                  }
                  onClose?.();
                }}
              />
            ))}
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 20px' }} />

          {/* Recommendations */}
          <div style={{ padding: '4px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Recommendations
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {BLOG_LINKS.map(item => (
              <SidebarItem
                key={item.href + item.label}
                {...item}
                active={pathname === item.href}
                onClick={onClose}
              />
            ))}
          </div>

          {/* Admin */}
          {user && user.role === 'ADMIN' && (
            <>
              <div style={{ padding: '4px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'orange', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Admin
              </div>
              <div style={{ padding: '0 0 8px' }}>
                <SidebarItem href="/admin" icon="admin_panel_settings" label="Admin Panel" active={pathname === '/admin'} onClick={onClose} />
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 20px' }} />
            </>
          )}

          {/* Info */}
          <div style={{ padding: '4px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Info & Help
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {INFO_LINKS.map(item => (
              <SidebarItem
                key={item.href + item.label}
                {...item}
                active={pathname === item.href}
                onClick={() => {
                  if (item.label === 'Support Us' || item.href === '/support') {
                    openSupport?.();
                  }
                  onClose?.();
                }}
              />
            ))}
          </div>

          {/* Policy */}
          <div style={{ padding: '12px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Legal & Policy
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {POLICY_LINKS.map(item => (
              <SidebarItem
                key={item.href + item.label}
                {...item}
                active={pathname === item.href}
                onClick={onClose}
              />
            ))}
          </div>

          {/* Socials */}
          <div style={{ padding: '12px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Join our Community
          </div>
          <div style={{ padding: '0 0 8px' }}>
            {SOCIAL_LINKS.map(item => (
              <SidebarItem
                key={item.href}
                {...item}
                external
                onClick={onClose}
              />
            ))}
          </div>

          {/* Support / Goal Bar */}
          <div style={{ margin: '16px 20px', padding: '16px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>Support Progress</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>{Math.round((GOAL_DATA.current / GOAL_DATA.target) * 100)}%</div>
            </div>
            
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ 
                height: '100%', 
                width: `${(GOAL_DATA.current / GOAL_DATA.target) * 100}%`, 
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                borderRadius: 4,
                transition: 'width 0.5s ease'
              }} />
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 12 }}>
              Target: <b>{GOAL_DATA.label}</b>. Support us to unlock this feature for everyone!
            </div>

            <button onClick={() => { openSupport?.(); onClose?.(); }} className="btn jewel-btn btn-sm" style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }}>
              Support Mani Reader
            </button>
          </div>

          {/* Separator */}
          {user && <div style={{ height: 1, background: 'var(--border)', margin: '8px 20px' }} />}

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                padding: '10px 20px', borderRadius: 10,
                color: 'var(--red)', background: 'transparent', border: 'none',
                fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,109,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>logout</span>
              Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
