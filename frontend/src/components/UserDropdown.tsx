"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaUser, FaCog, FaCreditCard, FaSignOutAlt, FaUserMd } from 'react-icons/fa';

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))] transition-colors">
        <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white">
          <FaUserMd />
        </div>
        <span className="hidden md:inline text-sm font-medium">
          Dr. {user.firstName} {user.lastName}
        </span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-[rgb(var(--card))] border-[rgb(var(--border))]">
        {/* Información del Usuario */}
        <DropdownMenuLabel className="text-[rgb(var(--foreground))]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl">
              <FaUserMd />
            </div>
            <div>
              <p className="font-semibold">Dr. {user.firstName} {user.lastName}</p>
              <p className="text-xs text-[rgb(var(--gray-medium))] font-normal">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Rol */}
        <div className="px-2 py-2 space-y-1">
          <div className="px-3 py-2 rounded-md bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.3)]">
            <p className="text-xs text-[rgb(var(--gray-medium))]">Rol</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))] capitalize">{user.role}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Opciones del Menú */}
        <div className="py-1">
          <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] transition-colors flex items-center gap-3">
            <FaUser className="text-base" />
            <span>{t('header.profile')}</span>
          </button>
          
          <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] transition-colors flex items-center gap-3">
            <FaCog className="text-base" />
            <span>{t('settings.title')}</span>
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] transition-colors flex items-center gap-3">
            <FaCreditCard className="text-base" />
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
            <FaSignOutAlt className="text-base" />
            <span>{t('header.logout')}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}