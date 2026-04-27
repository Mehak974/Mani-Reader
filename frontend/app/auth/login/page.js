'use client';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const { login, user, loading: authLoading } = useAuth() || {};
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Auto-redirect if already logged in as ADMIN
  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="form-card">
        <Link href="/" className="navbar-logo" style={{ display: 'block', marginBottom: 28 }}>
          Mani <span>Reader</span>
        </Link>
        <h1 className="form-title">Welcome back</h1>
        <p className="form-subtitle">Sign in to your account to continue reading.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              type="email" className="form-input"
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password" className="form-input"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
          <button
            id="login-submit"
            type="submit" className="btn btn-primary w-full"
            disabled={loading}
            style={{ padding: '13px', fontSize: '1rem', width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <AuthProvider><LoginContent /></AuthProvider>;
}
