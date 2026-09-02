'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { User, AuthResponseDto } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const currentToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!currentToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch {
      // If error or unauthorized, retain cached user or clear if needed
      const cachedUser = localStorage.getItem('user');
      if (cachedUser && cachedUser !== 'null' && cachedUser !== 'undefined') {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (data: AuthResponseDto) => {
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
