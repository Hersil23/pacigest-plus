"use client";

import { useState, useEffect } from 'react';
import SidebarItem from './SidebarItem';
import { NavSection } from '@/types/navigation';
import dashboardService, { DashboardStats } from '@/services/dashboardService';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar estado colapsado de localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  // Cargar estadísticas
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading sidebar stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar estado en localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState.toString());
  };

  // Navegación principal con datos dinámicos
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
        badge: loading ? undefined : stats?.stats.totalPatients || 0
      },
      {
        icon: '📅',
        label: 'Citas',
        labelKey: 'navigation.appointments',
        href: '/appointments',
        badge: loading ? undefined : stats?.stats.appointmentsToday || 0,
        badgeColor: 'info'
      },
      {
        icon: '📋',
        label: 'Emitir Informe Médico',
        labelKey: 'navigation.emitMedicalReport',
        href: '/medical-records'
      },
      {
        icon: '💊',
        label: 'Emitir Recipe',
        labelKey: 'navigation.emitRecipe',
        href: '/recipe',
        badge: loading ? undefined : stats?.stats.activePrescriptions || 0,
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
        labelKey: 'sidebar.help',
        href: '/help'
      }
    ]
  };

  return (
    <aside className={`
      hidden lg:flex flex-col
      bg-[rgb(var(--card))] border-r border-[rgb(var(--border))]
      transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Header del Sidebar con Toggle */}
      <div className="p-4 border-b border-[rgb(var(--border))]">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[rgb(var(--gray-very-light))] transition-colors"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <span className="text-xl">
            {collapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {mainNav.items.map((item, index) => (
          <SidebarItem 
            key={index} 
            item={item} 
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-[rgb(var(--border))] space-y-2">
        {footerNav.items.map((item, index) => (
          <SidebarItem 
            key={index} 
            item={item} 
            collapsed={collapsed}
          />
        ))}
      </div>
    </aside>
  );
}