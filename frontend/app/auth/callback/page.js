'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAccessToken } from '../../../lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
      
      // Fetch user to determine role
      import('../../../lib/api').then(({ authApi }) => {
        authApi.me().then(({ data }) => {
          const target = data.role === 'ADMIN' ? '/admin' : '/';
          setTimeout(() => {
            window.location.href = target;
          }, 500);
        }).catch(() => {
          window.location.href = '/';
        });
      });
    } else {
      router.push('/auth/login?error=no_token');
    }
  }, [searchParams, router]);

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
