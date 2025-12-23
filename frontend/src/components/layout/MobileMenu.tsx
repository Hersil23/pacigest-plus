"use client";

import { useEffect } from 'react';
import SidebarItem from './SidebarItem';
import { NavSection } from '@/types/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useLanguage();

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Navegación principal
  const mainNav: NavSection = {
    items: [
      {
        icon: '🏠',
        label: 'Dashboard',
        labelKey: 'navigation.dashboard',
        href: '/'
      },
      {
        icon: '👥',
        label: 'Pacientes',
        labelKey: 'navigation.patients',
        href: '/patients',
        badge: 127
      },
      {
        icon: '📅',
        label: 'Citas',
        labelKey: 'navigation.appointments',
        href: '/appointments',
        badge: 8,
        badgeColor: 'info'
      },
      {
        icon: '📋',
        label: 'Historias',
        labelKey: 'navigation.medicalRecords',
        href: '/medical-records'
      },
      {
        icon: '💊',
        label: 'Recetas',
        labelKey: 'navigation.prescriptions',
        href: '/prescriptions',
        badge: 23,
        badgeColor: 'success'
      },
      {
        icon: '📊',
        label: 'Estadísticas',
        labelKey: 'navigation.statistics',
        href: '/statistics'
      }
    ]
  };

  // Navegación secundaria (footer)
  const footerNav: NavSection = {
    items: [
      {
        icon: '⚙️',
        label: 'Configuración',
        labelKey: 'navigation.settings',
        href: '/settings'
      },
      {
        icon: '❓',
        label: 'Ayuda',
        labelKey: 'Ayuda',
        href: '/help'
      }
    ]
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50
        w-80 max-w-[85vw]
        bg-[rgb(var(--card))] border-r border-[rgb(var(--border))]
        flex flex-col
        lg:hidden
        animate-in slide-in-from-left duration-300
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl font-bold">
              🏥
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
              {t('common.appName')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--gray-very-light))] transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {mainNav.items.map((item, index) => (
            <SidebarItem 
              key={index} 
              item={item}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[rgb(var(--border))] space-y-2">
          {footerNav.items.map((item, index) => (
            <SidebarItem 
              key={index} 
              item={item}
              onClick={onClose}
            />
          ))}
        </div>
      </aside>
    </>
  );
}