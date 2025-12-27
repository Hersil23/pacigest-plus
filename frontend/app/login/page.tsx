"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <p className="text-[rgb(var(--foreground))]">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--primary))] text-white text-3xl font-bold mb-4">
            🏥
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-[rgb(var(--gray-medium))]">
            {t('auth.login')}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[rgb(var(--card))] rounded-lg shadow-lg border border-[rgb(var(--border))] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                placeholder="doctor@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error))] rounded-lg p-3">
                <p className="text-sm text-[rgb(var(--error))]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? t('common.loading') : t('auth.login')}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link 
                href="/forgot-password"
                className="text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-[rgb(var(--border))]">
              <p className="text-sm text-[rgb(var(--gray-medium))]">
                {t('auth.dontHaveAccount')}{' '}
                <Link 
                  href="/register"
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] font-medium transition-colors"
                >
                  {t('auth.register')}
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[rgb(var(--gray-medium))]">
            🔒 Conexión segura con cifrado end-to-end
          </p>
        </div>
      </div>
    </div>
  );
}