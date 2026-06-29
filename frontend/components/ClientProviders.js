'use client';
import React from 'react';
import { AuthProvider } from '../lib/auth';
import { ModalProvider } from '../context/ModalContext';
import UserActivity from './UserActivity';

export default function ClientProviders({ children }) {
  // ✅ REMOVED: the `!mounted` blank-screen guard that was causing:
  //   - LCP to fire only after JS hydration (was ~2.2s)
  //   - All MangaCard images to initialize with undefined src (no-cover bug)
  //   - Full re-render of every component on mount
  //
  // Auth state (user=null, loading=true) is the correct SSR default —
  // the UI already handles loading states individually per component.

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => { registration.update(); },
          () => { }
        );
      });
    }
  }, []);

  return (
    <AuthProvider>
      <ModalProvider>
        <UserActivity />
        {children}
      </ModalProvider>
    </AuthProvider>
  );
}