'use client';
import Link from 'next/link';

export default function LoginRequiredModal({ pageName, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      {/* Backdrop */}
      <div 
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0, 
          background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(12px)',
        }} 
      />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 32, padding: '40px 32px',
        textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.2)',
        animation: 'modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', color: 'var(--accent)'
        }}>
          <span className="material-icons" style={{ fontSize: '2rem' }}>lock</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
          Login Required
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
          Please login to access your <strong>{pageName}</strong>. Your reading progress and collections will be synced across all devices.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link 
            href="/auth/login"
            style={{
              padding: '16px', borderRadius: 16, background: 'var(--accent)',
              color: '#fff', fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
              boxShadow: '0 10px 15px -3px var(--accent-glow)'
            }}
          >
            Login to Account
          </Link>
          <button 
            onClick={onCancel}
            style={{
              padding: '16px', borderRadius: 16, background: '#f1f5f9',
              color: '#64748b', fontWeight: 700, fontSize: '0.95rem',
              border: 'none', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            Cancel
          </button>
        </div>

        <style jsx>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
