'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  specialisation?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('primecare_user');
    const savedToken = localStorage.getItem('primecare_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {}
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('primecare_user', JSON.stringify(userData));
    localStorage.setItem('primecare_token', authToken);

    if (userData.role === 'DOCTOR') {
      router.push('/doctor/dashboard');
    } else if (userData.role === 'ADMIN') {
      router.push('/admin/leaves');
    } else {
      router.push('/patient/book');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('primecare_user');
    localStorage.removeItem('primecare_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) { return { user: null, token: null, login: () => {}, logout: () => {}, isAuthenticated: false, loading: false } as any; }
  return context;
}

