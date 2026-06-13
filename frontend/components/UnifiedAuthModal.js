'use client';
import React from 'react';
import { useAuth } from '../lib/auth';

export default function UnifiedAuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = React.useState(initialView); // 'login' | 'register'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const { login, register } = useAuth() || {};

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>

        <div className="auth-header">
          <div className="jewel-icon">
            <span className="material-icons">{view === 'login' ? 'login' : 'person_add'}</span>
          </div>
          <h2>{view === 'login' ? 'Welcome Back' : 'Join Mani Reader'}</h2>
          <p>{view === 'login' ? 'Sign in to sync your library' : 'Create an account to start bookmarking'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {view === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          {view === 'login' ? (
            <p>New to Mani Reader? <button onClick={() => setView('register')}>Create Account</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setView('login')}>Sign In</button></p>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .modal-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            width: 100%;
            max-width: 420px;
            position: relative;
            padding: 40px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px var(--accent-glow);
            animation: modalFadeIn 0.3s ease;
          }
          @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            color: var(--text-3);
          }
          .jewel-icon {
            width: 50px;
            height: 50px;
            background: var(--accent);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            box-shadow: 0 5px 15px var(--accent-glow);
          }
          .jewel-icon span { color: #fff; font-size: 1.5rem; }
          .auth-header { text-align: center; margin-bottom: 24px; }
          .auth-header h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
          .auth-header p { color: var(--text-3); font-size: 0.9rem; }
          
          .auth-error {
            background: rgba(255, 77, 109, 0.1);
            color: var(--red);
            padding: 10px;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid rgba(255, 77, 109, 0.2);
          }
          
          .auth-form { display: flex; flex-direction: column; gap: 16px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-2); }
          .form-group input {
            background: var(--surface-2);
            border: 1px solid var(--border);
            padding: 12px;
            border-radius: 10px;
            color: var(--text);
            outline: none;
            transition: var(--transition);
          }
          .form-group input:focus { border-color: var(--accent); background: var(--surface-3); }
          
          .btn-block { padding: 14px; font-weight: 700; border-radius: 12px; margin-top: 8px; }
          
          .auth-footer { margin-top: 24px; text-align: center; }
          .auth-footer p { font-size: 0.9rem; color: var(--text-3); }
          .auth-footer button {
            background: none;
            color: var(--accent);
            font-weight: 700;
            cursor: pointer;
            padding: 0;
            margin-left: 4px;
          }
        `}</style>
      </div>
    </div>
  );
}
