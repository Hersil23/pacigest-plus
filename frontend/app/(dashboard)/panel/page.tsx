"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import dashboardService, { DashboardStats } from '@/services/dashboardService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUsers, FaCalendar, FaFileMedical, FaPrescription, FaChartLine, FaClock, FaExclamationTriangle } from 'react-icons/fa';

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
                ⏰ Tu prueba gratuita termina en <strong>{dashboardData.subscription.trialDaysLeft} día{dashboardData.subscription.trialDaysLeft !== 1 ? 's' : ''}</strong>
              </p>
            </div>
          )}

          {/* Estadísticas */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg p-6 animate-pulse" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
                  <div className="h-4 rounded w-1/2 mb-4" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                  <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'rgb(var(--gray-light))' }}></div>
                </div>
              ))}
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Pacientes */}
              <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
                <div className="flex items-center justify-between mb-2">
                  <FaUsers className="text-2xl" style={{ color: 'rgb(var(--success))' }} />
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--success), 0.1)', color: 'rgb(var(--success))' }}>
                    Total
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                  {dashboardData.stats.totalPatients}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('navigation.patients')}
                </p>
              </div>

              {/* Citas Hoy */}
              <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
                <div className="flex items-center justify-between mb-2">
                  <FaCalendar className="text-2xl" style={{ color: 'rgb(var(--info))' }} />
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--info), 0.1)', color: 'rgb(var(--info))' }}>
                    Hoy
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                  {dashboardData.stats.appointmentsToday}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                  Citas de hoy
                </p>
              </div>

              {/* Próximas Citas */}
              <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
                <div className="flex items-center justify-between mb-2">
                  <FaClock className="text-2xl" style={{ color: 'rgb(var(--primary))' }} />
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--primary), 0.1)', color: 'rgb(var(--primary))' }}>
                    Próximas
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                  {dashboardData.stats.upcomingAppointments}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                  Próximas citas
                </p>
              </div>

              {/* Recetas Activas */}
              <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
                <div className="flex items-center justify-between mb-2">
                  <FaPrescription className="text-2xl" style={{ color: 'rgb(var(--warning))' }} />
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--warning), 0.1)', color: 'rgb(var(--warning))' }}>
                    Activas
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                  {dashboardData.stats.activePrescriptions}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                  Recetas activas
                </p>
              </div>
            </div>
          ) : null}

          {/* Citas del Día */}
          {dashboardData && dashboardData.todayAppointments.length > 0 && (
            <div className="mb-8 rounded-lg shadow-md p-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  📅 Citas de Hoy
                </h2>
                <button
                  onClick={() => router.push('/appointments')}
                  className="text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
                >
                  Ver agenda completa →
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData.todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg flex items-center justify-between transition-all hover:shadow-md cursor-pointer"
                    style={{ backgroundColor: 'rgb(var(--background))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
                    onClick={() => router.push(`/appointments/${appointment.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }}>
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                          {appointment.patient}
                        </p>
                        <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                          {appointment.reason}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]'
                        : 'bg-[rgb(var(--warning)/0.2)] text-[rgb(var(--warning))]'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accesos Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link 
              href="/patients"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(var(--success), 0.2)', color: 'rgb(var(--success))' }}>
                  <FaUsers />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('navigation.patients')}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('panel.patientsDesc')}
              </p>
            </Link>

            <Link 
              href="/appointments"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(var(--info), 0.2)', color: 'rgb(var(--info))' }}>
                  <FaCalendar />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('navigation.appointments')}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('panel.appointmentsDesc')}
              </p>
            </Link>

            <Link 
              href="/medical-records"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(var(--warning), 0.2)', color: 'rgb(var(--warning))' }}>
                  <FaFileMedical />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('navigation.emitMedicalReport')}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('panel.medicalReportDesc')}
              </p>
            </Link>

            <Link 
              href="/recipe"
              className="rounded-lg p-6 shadow-sm hover:shadow-md transition-all group"
              style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(var(--primary), 0.2)', color: 'rgb(var(--primary))' }}>
                  <FaPrescription />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('navigation.emitRecipe')}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('panel.recipeDesc')}
              </p>
            </Link>
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