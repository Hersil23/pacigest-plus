"use client";

import { useLanguage } from '@/contexts/LanguageContext';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useLanguage();

  // Configuración de colores por estado
  const statusConfig: { [key: string]: { bg: string; text: string; border: string } } = {
    pending: {
      bg: 'bg-[rgb(var(--warning)/0.1)]',
      text: 'text-[rgb(var(--warning))]',
      border: 'border-[rgb(var(--warning)/0.3)]'
    },
    confirmed: {
      bg: 'bg-[rgb(var(--success)/0.1)]',
      text: 'text-[rgb(var(--success))]',
      border: 'border-[rgb(var(--success)/0.3)]'
    },
    'in-progress': {
      bg: 'bg-[rgb(var(--info)/0.1)]',
      text: 'text-[rgb(var(--info))]',
      border: 'border-[rgb(var(--info)/0.3)]'
    },
    completed: {
      bg: 'bg-[rgb(var(--gray-medium)/0.1)]',
      text: 'text-[rgb(var(--gray-medium))]',
      border: 'border-[rgb(var(--gray-medium)/0.3)]'
    },
    cancelled: {
      bg: 'bg-[rgb(var(--error)/0.1)]',
      text: 'text-[rgb(var(--error))]',
      border: 'border-[rgb(var(--error)/0.3)]'
    },
    'no-show': {
      bg: 'bg-[rgb(var(--error)/0.1)]',
      text: 'text-[rgb(var(--error))]',
      border: 'border-[rgb(var(--error)/0.3)]'
    }
  };

  // Tamaños
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${config.bg} ${config.text}
        border ${config.border}
        rounded-full font-medium
        whitespace-nowrap
      `}
    >
      {t(`appointments.status.${status}`) || status}
    </span>
  );
}