'use client';
import { useState } from 'react';
import { AuthProvider, useAuth } from '../../../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterContent() {
  const { register } = useAuth() || {};
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="form-card">
        <Link href="/" className="navbar-logo" style={{ display: 'block', marginBottom: 28 }}>
          Mani <span>Reader</span>
        </Link>
        <h1 className="form-title">Create account</h1>
        <p className="form-subtitle">Start building your personal manga library today.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="register-email"
              type="email" className="form-input"
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="register-password"
              type="password" className="form-input"
              placeholder="Min. 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              id="register-confirm"
              type="password" className="form-input"
              placeholder="Repeat password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
          <button
            id="register-submit"
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ padding: '13px', fontSize: '1rem', width: '100%' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <AuthProvider><RegisterContent /></AuthProvider>;
}
