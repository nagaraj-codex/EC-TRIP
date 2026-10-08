import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SessionInfo } from '../types/auth.types.js';
import { authService } from '../services/authService.js';

interface AuthContextType {
  user: User | null;
  sessionInfo: SessionInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Parameters<typeof authService.register>[0]) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setSessionInfo(res.sessionInfo || null);
      } else {
        setUser(null);
        setSessionInfo(null);
      }
    } catch {
      setUser(null);
      setSessionInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(identifier, password);
      if (res.success && res.user) {
        setUser(res.user);
        await refreshSession();
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Parameters<typeof authService.register>[0]) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        await refreshSession();
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Registration failed.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSessionInfo(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionInfo,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
