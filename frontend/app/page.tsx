"use client";

import Header from "@/components/layout/Header";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] transition-colors duration-300">
      {/* Header Simplificado */}
      <Header />

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Acciones Principales: Búsqueda + Nueva Cita */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Búsqueda Global */}
            <div className="flex-1">
              <SearchBar />
            </div>

            {/* Botón Nueva Cita */}
            <Link
              href="/appointments/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <span className="text-xl">➕</span>
              <span>{t('header.newAppointment')}</span>
            </Link>
          </div>

          {/* Bienvenida */}
          <div className="bg-gradient-to-r from-[rgb(var(--primary)/0.1)] to-[rgb(var(--accent)/0.1)] rounded-lg p-6 border border-[rgb(var(--border))]">
            <h2 className="text-2xl lg:text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
              ¡Bienvenido, Dr. Silva! 👋
            </h2>
            <p className="text-[rgb(var(--gray-medium))]">
              Tienes 8 citas programadas para hoy
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--success)/0.2)] flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
                {t('patients.totalPatients')}
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">127</p>
            </div>

            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--info)/0.2)] flex items-center justify-center text-2xl">
                  📅
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
                {t('appointments.today')}
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">8</p>
            </div>

            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--warning)/0.2)] flex items-center justify-center text-2xl">
                  ⏰
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
                {t('appointments.upcoming')}
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">15</p>
            </div>

            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary)/0.2)] flex items-center justify-center text-2xl">
                  💊
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
                Recetas Activas
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">23</p>
            </div>
          </div>

          {/* Citas de Hoy */}
          <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm">
            <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-4">
              📅 Citas de Hoy
            </h3>
            <div className="space-y-3">
              {[
                { time: '09:00', patient: 'Juan Pérez', type: 'Consulta General', status: 'confirmed' },
                { time: '10:30', patient: 'Ana López', type: 'Control', status: 'confirmed' },
                { time: '11:00', patient: 'Carlos Díaz', type: 'Primera Vez', status: 'scheduled' },
                { time: '14:00', patient: 'María García', type: 'Seguimiento', status: 'scheduled' },
              ].map((appointment, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[rgb(var(--primary))]">{appointment.time}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[rgb(var(--foreground))]">{appointment.patient}</p>
                      <p className="text-sm text-[rgb(var(--gray-medium))]">{appointment.type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]'
                      : 'bg-[rgb(var(--warning)/0.2)] text-[rgb(var(--warning))]'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Programada'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/patients" className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--success))] flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  👥
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.patients')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Gestionar pacientes e historias clínicas
              </p>
            </Link>

            <Link href="/appointments" className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--info))] flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  📅
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.appointments')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Ver y programar citas médicas
              </p>
            </Link>

            <Link href="/statistics" className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.statistics')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Reportes y análisis de datos
              </p>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}