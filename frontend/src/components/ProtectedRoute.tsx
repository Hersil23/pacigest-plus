"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnauthorizedPage from './UnauthorizedPage';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Mostrar página de acceso denegado después de un pequeño delay
      setTimeout(() => {
        setShowUnauthorized(true);
      }, 100);
    }
  }, [isAuthenticated, loading]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
          <p className="text-[rgb(var(--gray-medium))]">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar página de acceso denegado
  if (!isAuthenticated && showUnauthorized) {
    return <UnauthorizedPage />;
  }

  // Si está autenticado, mostrar contenido
  return <>{children}</>;
}