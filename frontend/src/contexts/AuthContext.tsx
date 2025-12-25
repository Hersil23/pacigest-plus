"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { LoginCredentials, RegisterData, AuthResponse } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = authService.getToken();
      
      if (!token || authService.isTokenExpired()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = authService.getUserFromToken();
      if (userData) {
        setUser({
          id: userData.id || userData.userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      
      if (response.user) {
        setUser(response.user);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response: AuthResponse = await authService.register(userData);
      
      // Si el registro fue exitoso pero requiere verificación de email
      if (response.userId) {
        // El authService ya guardó userId y email en localStorage
        router.push('/verify-email');
        return;
      }
      
      // Si por alguna razón viene con usuario directamente (no debería pasar)
      if (response.user) {
        setUser(response.user);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Limpiar estado de todos modos
      setUser(null);
      router.push('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}