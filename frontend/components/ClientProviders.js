'use client';
import { AuthProvider } from '../lib/auth';
import UserActivity from './UserActivity';

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <UserActivity />
      {children}
    </AuthProvider>
  );
}
