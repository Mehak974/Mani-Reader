'use client';
import { useEffect } from 'react';
import { userActivityApi } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function UserActivity() {
  const { user } = useAuth() || {};

  useEffect(() => {
    // Send immediate heartbeat on mount
    userActivityApi.heartbeat(30000).catch(() => {});

    const interval = setInterval(() => {
      userActivityApi.heartbeat(60000).catch(() => {});
    }, 60000); // Every 1 minute

    return () => clearInterval(interval);
  }, []); // Remove dependency on user to track guest sessions too

  return null;
}
