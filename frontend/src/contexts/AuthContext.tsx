"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  gender?: 'M' | 'F' | 'Otro';
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  verifyEmail: (userId: string, verificationToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        router.push('/panel');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authApi.register(userData);
      
      // Guardar datos para verificación
      if (response.userId) {
        localStorage.setItem('pendingUserId', response.userId);
        localStorage.setItem('pendingEmail', response.email);
        localStorage.setItem('verificationCode', response.verificationCode);
        
        // Redirigir a página de verificación
        router.push('/verify-email');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const verifyEmail = async (userId: string, verificationToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar email');
      }

      // Guardar token
      localStorage.setItem('token', data.token);
      
      // Limpiar datos temporales
      localStorage.removeItem('pendingUserId');
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('verificationCode');

      // Cargar usuario actual
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      // Redirigir al panel
      router.push('/panel');
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      verifyEmail, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}