'use client';
import React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Exchanges the one-time code issued by the backend for real httpOnly cookies.
// The code arrives in ?code=<hex> — never a raw JWT.
function CallbackContent() {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      // No code — something went wrong on the backend side
      window.location.href = '/auth/login?error=no_code';
      return;
    }

    // Exchange the one-time code for httpOnly cookies
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/exchange`, {
      method: 'POST',
      credentials: 'include', // send & receive cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Exchange failed');
        return r.json();
      })
      .then(() => {
        // Cookies are now set — determine role via /me
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: 'include',
        }).then((r) => r.json());
      })
      .then((user) => {
        const target = user.role === 'ADMIN' ? '/admin' : '/';
        setTimeout(() => { window.location.href = target; }, 400);
      })
      .catch(() => {
        window.location.href = '/auth/login?error=auth_failed';
      });
  }, [searchParams]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ 
          border: '4px solid rgba(255,255,255,0.05)', 
          borderTop: '4px solid #8b5cf6', 
          borderRadius: '50%', 
          width: 50, 
          height: 50, 
          animation: 'spin 1s linear infinite', 
          margin: '0 auto 24px',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
        }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Finalizing Login</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Securely connecting your Google Account...</p>
      </div>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
