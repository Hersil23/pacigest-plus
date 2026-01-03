"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import dashboardService, { DashboardStats } from '@/services/dashboardService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUsers, FaCalendar, FaFileMedical, FaPrescription, FaExclamationTriangle } from 'react-icons/fa';

export default function PanelPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <div className="max-w-7xl mx-auto">
          
          {/* Bienvenida */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
              {t('panel.welcome')}, Dr. {user?.firstName || 'Usuario'}! 👋
            </h1>
            <p className="mt-2" style={{ color: 'rgb(var(--gray-medium))' }}>
              {t('panel.controlPanel')} - {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Alerta de Trial */}
          {dashboardData?.subscription?.status === 'trial' && dashboardData?.subscription?.trialDaysLeft !== null && dashboardData.subscription.trialDaysLeft <= 3 && (
            <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ 
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              borderWidth: '1px',
              borderColor: 'rgb(var(--warning))'
            }}>
              <FaExclamationTriangle style={{ color: 'rgb(var(--warning))' }} className="text-xl" />
              <p style={{ color: 'rgb(var(--warning))' }}>
                ⏰ {t('panel.trialEnding')} <strong>{dashboardData.subscription.trialDaysLeft} {dashboardData.subscription.trialDaysLeft === 1 ? t('panel.day') : t('panel.days')}</strong>
              </p>
            </div>
          )}

          {/* 4 Cards Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Pacientes (CON número) */}
            <Link 
              href="/patients"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex items-center justify-between mb-2">
                <FaUsers className="text-2xl group-hover:scale-110 transition-transform" style={{ color: 'rgb(var(--success))' }} />
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--success), 0.1)', color: 'rgb(var(--success))' }}>
                  Total
                </span>
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 rounded w-1/3 mb-2" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                  <div className="h-4 rounded w-2/3" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                    {dashboardData?.stats.totalPatients || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                    {t('panel.totalPatients')}
                  </p>
                </>
              )}
            </Link>

            {/* Card 2: Citas (CON número) */}
            <Link 
              href="/appointments"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex items-center justify-between mb-2">
                <FaCalendar className="text-2xl group-hover:scale-110 transition-transform" style={{ color: 'rgb(var(--info))' }} />
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--info), 0.1)', color: 'rgb(var(--info))' }}>
                  {t('common.today')}
                </span>
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 rounded w-1/3 mb-2" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                  <div className="h-4 rounded w-2/3" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                    {dashboardData?.stats.appointmentsToday || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                    {t('panel.appointmentsToday')}
                  </p>
                </>
              )}
            </Link>

            {/* Card 3: Emitir Informe Médico (SIN número) */}
            <Link 
              href="/medical-records"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FaFileMedical className="text-4xl mb-3 group-hover:scale-110 transition-transform" style={{ color: 'rgb(var(--warning))' }} />
                <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('panel.issueReport')}
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('panel.manageClinicalHistories')}
                </p>
              </div>
            </Link>

            {/* Card 4: Emitir Receta (SIN número) */}
            <Link 
              href="/recipe"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FaPrescription className="text-4xl mb-3 group-hover:scale-110 transition-transform" style={{ color: 'rgb(var(--primary))' }} />
                <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('panel.issuePrescription')}
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('panel.generatePrescriptions')}
                </p>
              </div>
            </Link>
          </div>

          {/* Agenda de Citas del Día - Estilo Google Calendar */}
          <div className="mb-8 rounded-lg shadow-md p-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                📅 {t('panel.todayAppointments')}
              </h2>
              <button
                onClick={() => router.push('/appointments')}
                className="text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
              >
                {t('panel.viewFullSchedule')} →
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg animate-pulse" style={{ backgroundColor: 'rgb(var(--background))' }}>
                    <div className="h-4 rounded w-1/4 mb-2" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                    <div className="h-6 rounded w-1/2" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                  </div>
                ))}
              </div>
            ) : dashboardData && dashboardData.todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: 'rgb(var(--background))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm mb-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                          📅 {formatDate(appointment.time)}
                        </p>
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }}>
                            ⏰ {formatTime(appointment.time)}
                          </p>
                          <div>
                            <p className="font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                              👤 {appointment.patient}
                            </p>
                            <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                              📋 {appointment.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/appointments/${appointment.id}`)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
                        >
                          {t('panel.viewDetails')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('panel.noAppointmentsToday')}
                </p>
              </div>
            )}
          </div>

          {/* Información de Suscripción */}
          {user?.subscription?.status && (
            <div className="rounded-lg p-6 shadow-md" style={{ 
              background: 'linear-gradient(to right, rgba(var(--primary), 0.1), rgba(var(--accent), 0.1))',
              borderWidth: '1px',
              borderColor: 'rgb(var(--border))'
            }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                📊 {t('panel.subscriptionInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>{t('panel.currentPlan')}:</p>
                  <p className="text-lg font-semibold capitalize" style={{ color: 'rgb(var(--foreground))' }}>
                    {user.subscription.plan}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>{t('panel.status')}:</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.subscription.status === 'active' 
                      ? 'bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]'
                      : user.subscription.status === 'trial'
                      ? 'bg-[rgb(var(--warning)/0.2)] text-[rgb(var(--warning))]'
                      : 'bg-[rgb(var(--error)/0.2)] text-[rgb(var(--error))]'
                  }`}>
                    {user.subscription.status === 'active' ? t('panel.active') : 
                    user.subscription.status === 'trial' ? t('panel.trial') : t('panel.inactive')}
                  </span>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>{t('panel.email')}:</p>
                  <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}