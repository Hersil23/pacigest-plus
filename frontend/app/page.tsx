"use client";

import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] transition-colors duration-300">
      {/* Header con Theme Toggle y Language Toggle */}
      <header className="bg-[rgb(var(--sidebar))] border-b border-[rgb(var(--border))] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {t('common.appName')}
            </h1>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Bienvenida */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              🎨🌓🌐 Sistema Completo Funcionando
            </h2>
            <p className="text-lg text-[rgb(var(--gray-medium))]">
              {t('theme.changeTheme')} • {t('theme.changeMode')} • {t('settings.language')}
            </p>
          </div>

          {/* Cards de navegación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dashboard */}
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl">
                  🏠
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.dashboard')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Vista general del sistema
              </p>
            </div>

            {/* Pacientes */}
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--success))] flex items-center justify-center text-white text-xl">
                  👥
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.patients')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                {t('patients.patientList')}
              </p>
            </div>

            {/* Citas */}
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--info))] flex items-center justify-center text-white text-xl">
                  📅
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {t('navigation.appointments')}
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                {t('appointments.appointmentList')}
              </p>
            </div>
          </div>

          {/* Botones de ejemplo */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-all font-medium shadow-md hover:shadow-lg">
              {t('common.save')}
            </button>
            <button className="px-6 py-3 bg-[rgb(var(--success))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg">
              {t('common.confirm')}
            </button>
            <button className="px-6 py-3 bg-[rgb(var(--warning))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg">
              {t('common.edit')}
            </button>
            <button className="px-6 py-3 bg-[rgb(var(--error))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg">
              {t('common.delete')}
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-[rgb(var(--accent)/0.2)] rounded-lg p-6 border border-[rgb(var(--accent))] transition-colors">
            <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">
              💡 {t('settings.title')}
            </h4>
            <ul className="space-y-2 text-[rgb(var(--gray-medium))]">
              <li>✅ {t('settings.theme')}: Soft, Corporate, Medical</li>
              <li>✅ {t('theme.darkMode')} / {t('theme.lightMode')}</li>
              <li>✅ {t('settings.language')}: Español, English</li>
              <li>✅ {t('common.loading')} instantáneo</li>
              <li>✅ localStorage persistente</li>
              <li>✅ Completamente modular</li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}