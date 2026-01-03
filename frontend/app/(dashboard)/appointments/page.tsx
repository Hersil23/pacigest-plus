'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Appointment {
  _id: string;
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  status: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes?: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching appointments');
      
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(t('appointments.error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'rgb(234, 179, 8)',      // Amarillo
      'confirmed': 'rgb(34, 197, 94)',    // Verde
      'in-progress': 'rgb(59, 130, 246)', // Azul
      'completed': 'rgb(156, 163, 175)',  // Gris
      'cancelled': 'rgb(239, 68, 68)',    // Rojo
      'no-show': 'rgb(249, 115, 22)'      // Naranja
    };
    return colors[status as keyof typeof colors] || 'rgb(156, 163, 175)';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      `${apt.patientId.firstName} ${apt.patientId.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reasonForVisit.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <p style={{ color: 'rgb(var(--foreground))' }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/panel')}
            className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{
              backgroundColor: 'rgb(var(--card))',
              color: 'rgb(var(--foreground))',
              borderWidth: '1px',
              borderColor: 'rgb(var(--border))'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('common.back')}
          </button>

          {/* Title and New Button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.title')}
              </h1>
              <p className="mt-1" style={{ color: 'rgb(var(--foreground))', opacity: 0.7 }}>
                {t('appointments.subtitle')}
              </p>
            </div>
            <button
              onClick={() => router.push('/appointments/new')}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('appointments.new')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'rgb(var(--card))' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('common.search')}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('appointments.searchPlaceholder')}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgb(var(--background))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('common.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgb(var(--background))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              >
                <option value="all">{t('appointments.status.all')}</option>
                <option value="pending">{t('appointments.status.pending')}</option>
                <option value="confirmed">{t('appointments.status.confirmed')}</option>
                <option value="in-progress">{t('appointments.status.inProgress')}</option>
                <option value="completed">{t('appointments.status.completed')}</option>
                <option value="cancelled">{t('appointments.status.cancelled')}</option>
                <option value="no-show">{t('appointments.status.noShow')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: '1px',
            borderColor: 'rgb(var(--error))'
          }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error}</p>
          </div>
        )}

        {/* Appointments List - ESTILO GOOGLE CALENDAR */}
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('appointments.noAppointments')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-4 rounded-lg transition-all hover:shadow-md cursor-pointer"
                  style={{ backgroundColor: 'rgb(var(--background))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
                  onClick={() => router.push(`/appointments/${appointment._id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      {/* Fecha completa */}
                      <p className="text-sm mb-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                        📅 {formatDate(appointment.appointmentDate)}
                      </p>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Hora grande */}
                        <p className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }}>
                          ⏰ {appointment.appointmentTime}
                        </p>
                        
                        {/* Paciente y motivo */}
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                            👤 {appointment.patientId.firstName} {appointment.patientId.lastName}
                          </p>
                          <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                            📋 {appointment.reasonForVisit}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status badge y número */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs mb-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                          #{appointment.appointmentNumber}
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {t(`appointments.status.${appointment.status}`)}
                        </span>
                      </div>
                      
                      {/* Arrow icon */}
                      <svg className="w-5 h-5" style={{ color: 'rgb(var(--gray-medium))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}