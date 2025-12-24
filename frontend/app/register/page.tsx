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
    phone: '',
    specialty: '',
    licenseNumber: '',
    selectedPlan: 'trial',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const plans = [
    {
      value: 'trial',
      name: 'Trial',
      description: '7 días gratis - Prueba completa',
      price: 'Gratis',
      recommended: false,
    },
    {
      value: 'individual',
      name: 'Individual',
      description: '1-10 médicos - $30/médico/mes',
      price: '$30/mes',
      recommended: true,
    },
    {
      value: 'clinic',
      name: 'Clínica',
      description: '11-49 médicos - $20/médico/mes',
      price: '$20/mes',
      recommended: false,
    },
    {
      value: 'hospital',
      name: 'Hospital',
      description: '50+ médicos - $17/médico/mes',
      price: '$17/mes',
      recommended: false,
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar complejidad de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&#)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, selectedPlan, ...registerData } = formData;
      await register({
        ...registerData,
        subscription: {
          plan: selectedPlan,
        },
      });
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
      <div className="w-full max-w-4xl">
        
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
            
            {/* Selector de Plan */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-3">
                Selecciona tu plan *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {plans.map((plan) => (
                  <label
                    key={plan.value}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      formData.selectedPlan === plan.value
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                        : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.5)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedPlan"
                      value={plan.value}
                      checked={formData.selectedPlan === plan.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {plan.recommended && (
                      <span className="absolute -top-2 -right-2 bg-[rgb(var(--primary))] text-white text-xs font-bold px-2 py-1 rounded-full">
                        POPULAR
                      </span>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-[rgb(var(--foreground))] mb-1">
                        {plan.name}
                      </p>
                      <p className="text-lg font-bold text-[rgb(var(--primary))] mb-2">
                        {plan.price}
                      </p>
                      <p className="text-xs text-[rgb(var(--gray-medium))]">
                        {plan.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
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
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                  Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial
                </p>
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