"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserDropdown() {
  const { t } = useLanguage();

  // Datos del usuario (temporalmente hardcoded, después vendrá del backend/auth)
  const user = {
    name: 'Dr. Carlos Silva',
    email: 'carlos.silva@pacigest.com',
    role: 'Médico',
    subscription: 'Premium Individual',
    avatar: '👨‍⚕️'
  };

  const handleLogout = () => {
    // TODO: Implementar logout real con el backend
    console.log('Logout clicked');
    alert('Función de logout - próximamente conectada al backend');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))] transition-colors">
        <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-lg">
          {user.avatar}
        </div>
        <span className="hidden md:inline text-sm font-medium">{user.name}</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-[rgb(var(--card))] border-[rgb(var(--border))]">
        {/* Información del Usuario */}
        <DropdownMenuLabel className="text-[rgb(var(--foreground))]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-2xl">
              {user.avatar}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-[rgb(var(--gray-medium))] font-normal">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Rol y Suscripción */}
        <div className="px-2 py-2 space-y-1">
          <div className="px-3 py-2 rounded-md bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.3)]">
            <p className="text-xs text-[rgb(var(--gray-medium))]">Rol</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{user.role}</p>
          </div>
          <div className="px-3 py-2 rounded-md bg-[rgb(var(--primary)/0.1)] border border-[rgb(var(--primary)/0.3)]">
            <p className="text-xs text-[rgb(var(--gray-medium))]">Suscripción</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{user.subscription}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Opciones del Menú */}
        <div className="py-1">
          <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] transition-colors flex items-center gap-3">
            <span className="text-lg">👤</span>
            <span>{t('header.profile')}</span>
          </button>
          
          <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] transition-colors flex items-center gap-3">
            <span className="text-lg">⚙️</span>
            <span>{t('settings.title')}</span>
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] transition-colors flex items-center gap-3">
            <span className="text-lg">💳</span>
            <span>Mi Suscripción</span>
          </button>
        </div>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Cerrar Sesión */}
        <div className="py-1">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.1)] transition-colors flex items-center gap-3 font-medium"
          >
            <span className="text-lg">🚪</span>
            <span>{t('header.logout')}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}