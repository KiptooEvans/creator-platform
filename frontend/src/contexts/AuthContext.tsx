'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginData, RegisterData, AuthTokens } from '@/lib/api';
import apiService from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && apiService.isAuthenticated();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        apiService.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.login(data);
      
      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        apiService.storeTokens(tokens);
        setUser(user);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.register(data);
      
      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        apiService.storeTokens(tokens);
        setUser(user);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.clearTokens();
      setUser(null);
      setLoading(false);
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiService.getCurrentUser();
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      } else {
        throw new Error('Failed to get user data');
      }
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      apiService.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;