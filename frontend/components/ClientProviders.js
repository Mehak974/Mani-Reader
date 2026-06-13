'use client';
import React from 'react';
import { AuthProvider } from '../lib/auth';
import { ModalProvider } from '../context/ModalContext';
import UserActivity from './UserActivity';

export default function ClientProviders({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered:', registration.scope);
            registration.update(); // Force update to v2-flush
          },
          (err) => console.log('SW registration failed:', err)
        );
      });
    }
  }, []);

  if (!mounted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }} suppressHydrationWarning />
    );
  }

  return (
    <AuthProvider>
      <ModalProvider>
        <UserActivity />
        {children}
      </ModalProvider>
    </AuthProvider>
  );
}
