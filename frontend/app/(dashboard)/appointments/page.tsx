"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import AppointmentFilters from '@/components/appointments/AppointmentFilters';
import { getByDoctor, confirm, cancel, deleteAppointment } from '@/services/appointmentsService';
import Link from 'next/link';
import { FaPlus, FaCalendar } from 'react-icons/fa';

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0
  });

  // Cargar citas
  useEffect(() => {
    loadAppointments();
  }, [filters, user]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getByDoctor(user._id, {
        status: filters.status || undefined,
        date: filters.date || undefined,
        limit: 20
      });

      let appointmentsData = response.data || [];

      // Filtro de búsqueda en frontend
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        appointmentsData = appointmentsData.filter((apt: any) => {
          const patientName = `${apt.patientId.firstName} ${apt.patientId.lastName}`.toLowerCase();
          const reason = apt.reasonForVisit.toLowerCase();
          return patientName.includes(searchLower) || reason.includes(searchLower);
        });
      }

      setAppointments(appointmentsData);
      calculateStats(appointmentsData);

    } catch (err: any) {
      console.error('Error loading appointments:', err);
      setError(err.message || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (data: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats({
      total: data.length,
      today: data.filter((apt: any) => 
        apt.appointmentDate.split('T')[0] === today
      ).length,
      pending: data.filter((apt: any) => apt.status === 'pending').length,
      confirmed: data.filter((apt: any) => apt.status === 'confirmed').length
    });
  };

  // Confirmar cita
  const handleConfirm = async (id: string) => {
    try {
      await confirm(id);
      loadAppointments();
      alert(t('appointments.confirmed'));
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      alert(t('appointments.error'));
    }
  };

  // Cancelar cita
  const handleCancel = async (id: string) => {
    const reason = prompt(t('appointments.cancellationReason'));
    if (!reason) return;

    const confirmed = window.confirm(t('appointments.confirmCancel'));
    if (!confirmed) return;

    try {
      await cancel(id, reason);
      loadAppointments();
      alert(t('appointments.cancelled'));
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      alert(t('appointments.error'));
    }
  };

  // Eliminar cita
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t('appointments.confirmDelete'));
    if (!confirmed) return;

    try {
      await deleteAppointment(id);
      loadAppointments();
      alert(t('appointments.deleted'));
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      alert(t('appointments.error'));
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {/* BOTÓN VOLVER */}
            <Link
              href="/panel"
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t('print.back')}</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              📅 {t('appointments.title')}
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-1">
              {t('appointments.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/appointments/today"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))] hover:bg-[rgb(var(--info)/0.2)] transition-colors font-medium"
            >
              <FaCalendar />
              <span>{t('appointments.schedule')}</span>
            </Link>
            <Link
              href="/appointments/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium shadow-md"
            >
              <FaPlus />
              <span>{t('appointments.new')}</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
            <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
              {t('appointments.stats.total')}
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {stats.total}
            </p>
          </div>
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
            <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
              {t('appointments.stats.today')}
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--info))]">
              {stats.today}
            </p>
          </div>
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
            <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
              {t('appointments.stats.pending')}
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--warning))]">
              {stats.pending}
            </p>
          </div>
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
            <p className="text-sm text-[rgb(var(--gray-medium))] mb-1">
              {t('appointments.stats.confirmed')}
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">
              {stats.confirmed}
            </p>
          </div>
        </div>

        {/* Content: Filtros + Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Filtros (Sidebar) */}
          <div className="lg:col-span-1">
            <AppointmentFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Lista de Citas */}
          <div className="lg:col-span-3">
            
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))]"></div>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error)/0.3)] rounded-lg p-4 text-center">
                <p className="text-[rgb(var(--error))]">❌ {error}</p>
                <button
                  onClick={loadAppointments}
                  className="mt-3 px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))]"
                >
                  {t('common.retry') || 'Reintentar'}
                </button>
              </div>
            )}

            {/* Sin resultados */}
            {!loading && !error && appointments.length === 0 && (
              <div className="bg-[rgb(var(--card))] rounded-lg p-12 border border-[rgb(var(--border))] text-center">
                <p className="text-[rgb(var(--gray-medium))] text-lg mb-4">
                  📅 {t('appointments.noAppointments')}
                </p>
                <Link
                  href="/appointments/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors"
                >
                  <FaPlus />
                  <span>{t('appointments.new')}</span>
                </Link>
              </div>
            )}

            {/* Lista de Cards */}
            {!loading && !error && appointments.length > 0 && (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}