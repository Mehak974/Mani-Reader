'use client';
import React from 'react';
import { userActivityApi } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function UserActivity() {
  const { user } = useAuth() || {};

  React.useEffect(() => {
    // Only send heartbeat every 5 minutes to save bandwidth/requests
    const interval = setInterval(() => {
      userActivityApi.heartbeat(300000).catch(() => {});
    }, 300000); 

    return () => clearInterval(interval);
  }, []); // Run once on app mount

  return null;
}
