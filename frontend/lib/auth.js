'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAccessToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
