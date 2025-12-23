"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';

// Tipo para las notificaciones (temporalmente hardcoded, después vendrá del backend)
interface Notification {
  id: string;
  type: 'appointment' | 'payment' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationDropdown() {
  const { t } = useLanguage();

  // Notificaciones de ejemplo (después vendrán del backend)
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Nueva cita programada',
      message: 'Juan Pérez - Mañana 10:00 AM',
      time: 'Hace 5 min',
      read: false
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Recordatorio de cita',
      message: 'Ana López en 2 horas',
      time: 'Hace 1 hora',
      read: false
    },
    {
      id: '3',
      type: 'payment',
      title: 'Pago recibido',
      message: 'Suscripción renovada exitosamente',
      time: 'Hace 2 horas',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch(type) {
      case 'appointment': return '📅';
      case 'payment': return '💳';
      case 'reminder': return '⏰';
      case 'system': return 'ℹ️';
      default: return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))] transition-colors">
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[rgb(var(--error))] rounded-full">
            {unreadCount}
          </span>
        )}
        <span className="hidden md:inline text-sm font-medium">{t('header.notifications')}</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 bg-[rgb(var(--card))] border-[rgb(var(--border))] max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="text-[rgb(var(--foreground))] flex items-center justify-between">
          <span>🔔 {t('header.notifications')}</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-[rgb(var(--error))] text-white px-2 py-0.5 rounded-full">
              {unreadCount} {unreadCount === 1 ? 'nueva' : 'nuevas'}
            </span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-[rgb(var(--gray-medium))]">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">{t('header.noNotifications')}</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={`
                  w-full px-4 py-3 text-left hover:bg-[rgb(var(--gray-very-light))] transition-colors
                  border-l-4 ${notification.read 
                    ? 'border-transparent' 
                    : 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-[rgb(var(--foreground))] ${!notification.read && 'font-semibold'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-[rgb(var(--gray-medium))] truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />
            <button className="w-full px-4 py-2 text-sm text-center text-[rgb(var(--primary))] hover:bg-[rgb(var(--gray-very-light))] transition-colors font-medium">
              Ver todas las notificaciones
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}