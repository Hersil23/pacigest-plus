"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FaUsers, FaCalendar, FaFileMedical, FaPrescription } from 'react-icons/fa';

export default function PanelPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[rgb(var(--background))] p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Bienvenida */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              {t('panel.welcome')}, Dr. {user?.firstName || 'Usuario'}! 👋
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-2">
              {t('panel.controlPanel')} - {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Accesos Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link 
              href="/patients"
              className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--success)/0.2)] flex items-center justify-center text-[rgb(var(--success))] text-xl group-hover:scale-110 transition-transform">
                  <FaUsers />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.patients')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))] text-sm">
                {t('panel.patientsDesc')}
              </p>
            </Link>

            <Link 
              href="/appointments"
              className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--info)/0.2)] flex items-center justify-center text-[rgb(var(--info))] text-xl group-hover:scale-110 transition-transform">
                  <FaCalendar />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.appointments')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))] text-sm">
                {t('panel.appointmentsDesc')}
              </p>
            </Link>

            <Link 
              href="/medical-records"
              className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--warning)/0.2)] flex items-center justify-center text-[rgb(var(--warning))] text-xl group-hover:scale-110 transition-transform">
                  <FaFileMedical />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.emitMedicalReport')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))] text-sm">
                {t('panel.medicalReportDesc')}
              </p>
            </Link>

            <Link 
              href="/recipe"
              className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all hover:border-[rgb(var(--primary))] group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary)/0.2)] flex items-center justify-center text-[rgb(var(--primary))] text-xl group-hover:scale-110 transition-transform">
                  <FaPrescription />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.emitRecipe')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))] text-sm">
                {t('panel.recipeDesc')}
              </p>
            </Link>
          </div>

          {/* Información de Suscripción */}
          {user?.subscription?.status && (
            <div className="bg-gradient-to-r from-[rgb(var(--primary)/0.1)] to-[rgb(var(--accent)/0.1)] rounded-lg p-6 border border-[rgb(var(--border))]">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                📊 {t('panel.subscriptionInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-[rgb(var(--gray-medium))]">{t('panel.currentPlan')}:</p>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))] capitalize">
                    {user.subscription.plan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--gray-medium))]">{t('panel.status')}:</p>
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
                  <p className="text-sm text-[rgb(var(--gray-medium))]">{t('panel.email')}:</p>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
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