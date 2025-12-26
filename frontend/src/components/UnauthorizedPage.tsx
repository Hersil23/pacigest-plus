"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] p-6">
      <div className="max-w-md w-full">
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-8 text-center shadow-lg">
          {/* Icono */}
          <div className="w-20 h-20 rounded-full bg-[rgb(var(--warning)/0.2)] flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🔒</span>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-3">
            Acceso Restringido
          </h1>

          {/* Mensaje */}
          <p className="text-[rgb(var(--gray-medium))] mb-8">
            Debes iniciar sesión para acceder a esta página.
          </p>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium shadow-md"
            >
              Iniciar Sesión
            </Link>

            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] transition-colors font-medium"
            >
              Volver Atrás
            </button>
          </div>

          {/* Info adicional */}
          <p className="text-sm text-[rgb(var(--gray-medium))] mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[rgb(var(--primary))] hover:underline font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}