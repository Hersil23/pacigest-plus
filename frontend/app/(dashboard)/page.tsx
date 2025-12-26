"use client";

import { useState, useEffect } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import ProtectedRoute from '@/components/ProtectedRoute';
import dashboardService, { DashboardStats } from "@/services/dashboardService";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Traducir estado de cita
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Programada',
      'confirmed': 'Confirmada',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
              <p className="text-[rgb(var(--gray-medium))]">Cargando dashboard...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-[rgb(var(--error))] mb-4">❌ {error}</p>
              <button
                onClick={loadDashboardStats}
                className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))]"
              >
                Reintentar
              </button>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // No data state
  if (!stats) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-[rgb(var(--gray-medium))]">No hay datos disponibles</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Acciones Principales: Búsqueda + Nuevo Paciente */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Búsqueda Global */}
            <div className="flex-1">
              <SearchBar />
            </div>

            {/* Botón Nuevo Paciente */}
            <Link
              href="/patients/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <span className="text-xl">➕</span>
              <span>Nuevo Paciente</span>
            </Link>
          </div>

          {/* Bienvenida + Info de Suscripción */}
          <div className="bg-gradient-to-r from-[rgb(var(--primary)/0.1)] to-[rgb(var(--accent)/0.1)] rounded-lg p-6 border border-[rgb(var(--border))]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
                  ¡Bienvenido, Dr. {stats.user.firstName} {stats.user.lastName}! 👋
                </h2>
                <p className="text-[rgb(var(--gray-medium))]">
                  Tienes {stats.stats.appointmentsToday} citas programadas para hoy
                </p>
              </div>
              
              {/* Badge de Suscripción */}
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  stats.subscription.status === 'trial'
                    ? 'bg-[rgb(var(--warning)/0.2)] text-[rgb(var(--warning))]'
                    : stats.subscription.status === 'active'
                    ? 'bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]'
                    : 'bg-[rgb(var(--error)/0.2)] text-[rgb(var(--error))]'
                }`}>
                  Plan: {stats.subscription.plan.charAt(0).toUpperCase() + stats.subscription.plan.slice(1)}
                </span>
                
                {stats.subscription.status === 'trial' && stats.subscription.trialDaysLeft !== null && (
                  <p className="text-sm text-[rgb(var(--warning))]">
                    Trial expira en {stats.subscription.trialDaysLeft} {stats.subscription.trialDaysLeft === 1 ? 'día' : 'días'}
                  </p>
                )}
              </div>
            </div>
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
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.stats.totalPatients}</p>
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
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.stats.appointmentsToday}</p>
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
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.stats.upcomingAppointments}</p>
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
              <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.stats.activePrescriptions}</p>
            </div>
          </div>

          {/* Citas de Hoy */}
          <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm">
            <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-4">
              📅 Citas de Hoy
            </h3>
            
            {stats.todayAppointments.length === 0 ? (
              <p className="text-center text-[rgb(var(--gray-medium))] py-8">
                No tienes citas programadas para hoy
              </p>
            ) : (
              <div className="space-y-3">
                {stats.todayAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[rgb(var(--primary))]">
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-[rgb(var(--foreground))]">{appointment.patient}</p>
                        <p className="text-sm text-[rgb(var(--gray-medium))]">{appointment.reason || 'Consulta'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]'
                        : 'bg-[rgb(var(--warning)/0.2)] text-[rgb(var(--warning))]'
                    }`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
      </MainLayout>
    </ProtectedRoute>
  );
}