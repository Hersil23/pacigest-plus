"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const { verifyEmail } = useAuth();
  const router = useRouter();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [serverCode, setServerCode] = useState('');

  useEffect(() => {
    // Obtener datos del registro
    const pendingUserId = localStorage.getItem('pendingUserId');
    const pendingEmail = localStorage.getItem('pendingEmail');
    const code = localStorage.getItem('verificationCode');
    
    if (!pendingUserId || !pendingEmail) {
      router.push('/register');
      return;
    }
    
    setUserId(pendingUserId);
    setEmail(pendingEmail);
    
    // SOLO PARA TESTING - mostrar código del servidor
    if (code) {
      setServerCode(code);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyEmail(userId, verificationCode);
      // La redirección se maneja en AuthContext
    } catch (err: any) {
      setError(err.message || 'Error al verificar email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--primary))] text-white text-3xl font-bold mb-4">
            ✉️
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
            Verifica tu Email
          </h1>
          <p className="text-[rgb(var(--gray-medium))]">
            Hemos enviado un código de 6 dígitos a:
          </p>
          <p className="text-[rgb(var(--primary))] font-semibold mt-2">
            {email}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[rgb(var(--card))] rounded-lg shadow-lg border border-[rgb(var(--border))] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                maxLength={6}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all text-center text-2xl font-mono tracking-widest"
                autoFocus
              />
              <p className="text-xs text-[rgb(var(--gray-medium))] mt-2 text-center">
                Ingresa el código de 6 dígitos que recibiste por email
              </p>
            </div>

            {/* Mostrar código del servidor (TEMPORAL - solo para testing) */}
            {serverCode && (
              <div className="bg-[rgb(var(--warning)/0.1)] border border-[rgb(var(--warning))] rounded-lg p-4">
                <p className="text-sm text-[rgb(var(--warning))] font-semibold mb-2">
                  🔧 SOLO PARA TESTING:
                </p>
                <p className="text-sm text-[rgb(var(--foreground))]">
                  Código de verificación: <span className="font-mono font-bold text-lg">{serverCode}</span>
                </p>
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-2">
                  Este mensaje no aparecerá en producción
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error))] rounded-lg p-3">
                <p className="text-sm text-[rgb(var(--error))]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || verificationCode.length !== 6}
              className="w-full px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? 'Verificando...' : 'Verificar Email'}
            </button>

            {/* Reenviar código */}
            <div className="text-center pt-4 border-t border-[rgb(var(--border))]">
              <p className="text-sm text-[rgb(var(--gray-medium))] mb-2">
                ¿No recibiste el código?
              </p>
              <button
                type="button"
                className="text-sm text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] font-medium transition-colors"
                onClick={() => {
                  // TODO: Implementar reenvío de código
                  alert('Función de reenvío en desarrollo');
                }}
              >
                Reenviar código
              </button>
            </div>

            {/* Volver a registro */}
            <div className="text-center">
              <Link 
                href="/register"
                className="text-sm text-[rgb(var(--gray-medium))] hover:text-[rgb(var(--foreground))] transition-colors"
              >
                ← Volver al registro
              </Link>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[rgb(var(--gray-medium))]">
            💡 Si el email no llega en 5 minutos, revisa tu carpeta de spam
          </p>
        </div>
      </div>
    </div>
  );
}