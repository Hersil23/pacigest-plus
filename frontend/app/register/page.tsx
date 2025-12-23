"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    specialty: '',
    licenseNumber: '',
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
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
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
      <div className="w-full max-w-2xl">
        
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--primary))] text-white text-3xl font-bold mb-4">
            🏥
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-[rgb(var(--gray-medium))]">
            {t('auth.register')}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[rgb(var(--card))] rounded-lg shadow-lg border border-[rgb(var(--border))] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                  placeholder="Juan"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('auth.email')} *
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

            {/* Teléfono */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                placeholder="+58 412 1234567"
              />
            </div>

            {/* Especialidad y Licencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                  placeholder="Medicina General"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                  placeholder="123456"
                />
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  {t('auth.password')} *
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                  placeholder="••••••••"
                />
              </div>
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
              {isSubmitting ? t('common.loading') : t('auth.register')}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-[rgb(var(--border))]">
              <p className="text-sm text-[rgb(var(--gray-medium))]">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link 
                  href="/login"
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] font-medium transition-colors"
                >
                  {t('auth.login')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}