'use client';
import React from 'react';
import { useAuth } from '../lib/auth';
import Link from 'next/link';

export default function LoginRequiredModal({ pageName, onCancel }) {
  const { login, register } = useAuth() || {};
  const [view, setView] = React.useState('login'); // 'login' | 'register'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        await login(email, password);
        window.location.reload(); // Refresh to update user state across the page
      } else {
        if (password !== confirm) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(email, password);
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || (view === 'login' ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

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
          background: 'rgba(10, 10, 20, 0.7)', 
          backdropFilter: 'blur(12px)',
        }} 
      />

      {/* Modal Card */}
      <div className="auth-modal-card" style={{
        position: 'relative', width: '100%', maxWidth: 420,
        background: 'var(--surface)', borderRadius: 28, padding: '40px 32px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        border: '1px solid var(--border)',
        animation: 'modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'rgba(108,99,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--accent)'
          }}>
            <span className="material-icons" style={{ fontSize: '1.8rem' }}>
              {view === 'login' ? 'login' : 'person_add'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>
            {view === 'login' ? 'Login Required' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Please login to access your <strong>{pageName}</strong>. Your reading progress and collections will be synced across all devices.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Email</label>
            <input
              type="email" className="form-input"
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required style={{ padding: '12px 16px' }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Password</label>
            <input
              type="password" className="form-input"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required style={{ padding: '12px 16px' }}
            />
          </div>

          {view === 'register' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Confirm Password</label>
              <input
                type="password" className="form-input"
                placeholder="Repeat password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                required style={{ padding: '12px 16px' }}
              />
            </div>
          )}

          {error && <div className="form-error" style={{ fontSize: '0.8rem', padding: '10px' }}>{error}</div>}

          <button
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', marginTop: 8 }}
          >
            {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-3)' }}>
          {view === 'login' ? (
            <>Don't have an account? <button onClick={() => setView('register')} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setView('login')} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign in</button></>
          )}
        </div>

        <button 
          onClick={onCancel}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: 'pointer', padding: 4
          }}
        >
          <span className="material-icons">close</span>
        </button>

        <style jsx>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .auth-modal-card :global(.form-input) {
            background: var(--surface-2);
            border: 1px solid var(--border);
            color: var(--text);
            width: 100%;
            border-radius: 12px;
            outline: none;
            transition: all 0.2s;
          }
          .auth-modal-card :global(.form-input:focus) {
            border-color: var(--accent);
            box-shadow: 0 0 0 4px rgba(108,99,255,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
