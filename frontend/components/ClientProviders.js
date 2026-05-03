'use client';
import { useEffect } from 'react';
import { AuthProvider } from '../lib/auth';
import UserActivity from './UserActivity';

export default function ClientProviders({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => console.log('SW registered:', registration.scope),
          (err) => console.log('SW registration failed:', err)
        );
      });
    }
  }, []);

  return (
    <AuthProvider>
      <UserActivity />
      {children}
    </AuthProvider>
  );
}
