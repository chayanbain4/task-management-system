'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { storage } from '@/lib/storage';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    // Send stored refresh token in body as fallback for cross-port localhost cookie issues
    const storedRefreshToken = storage.getRefreshToken();

    try {
      const response = await authApi.refresh(storedRefreshToken ?? undefined);
      const data = response.data.data;
      setUser(data.user);
      setAccessToken(data.accessToken);
      storage.setUser(data.user);
      storage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        storage.setRefreshToken(data.refreshToken);
      }
    } catch {
      // Only clear if there is truly nothing stored — don't wipe valid session
      const hasStoredSession = storage.getUser() && storage.getAccessToken();
      if (!hasStoredSession) {
        storage.clearAll();
        setUser(null);
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = storage.getUser();
    const storedToken = storage.getAccessToken();

    if (storedUser) setUser(storedUser);
    if (storedToken) setAccessToken(storedToken);

    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const response = await authApi.login(payload);
    const data = response.data.data;
    setUser(data.user);
    setAccessToken(data.accessToken);
    storage.setUser(data.user);
    storage.setAccessToken(data.accessToken);
    if (data.refreshToken) {
      storage.setRefreshToken(data.refreshToken);
    }
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (payload: { name: string; email: string; password: string }) => {
    const response = await authApi.register(payload);
    const data = response.data.data;
    setUser(data.user);
    setAccessToken(data.accessToken);
    storage.setUser(data.user);
    storage.setAccessToken(data.accessToken);
    if (data.refreshToken) {
      storage.setRefreshToken(data.refreshToken);
    }
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    const storedRefreshToken = storage.getRefreshToken();
    try {
      await authApi.logout(storedRefreshToken ?? undefined);
    } finally {
      storage.clearAll();
      setUser(null);
      setAccessToken(null);
      router.push('/login');
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      logout,
      restoreSession
    }),
    [user, accessToken, isLoading, login, register, logout, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};