'use client';
import React, { createContext, useContext } from 'react';
import { authApi, setAccessToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [revealNsfw, setRevealNsfw] = React.useState(false);

  React.useEffect(() => {
    authApi.me()
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }

  async function register(email, password) {
    const { data } = await authApi.register(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await authApi.logout();
    setAccessToken(null);
    setUser(null);
    setRevealNsfw(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, revealNsfw, setRevealNsfw }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
