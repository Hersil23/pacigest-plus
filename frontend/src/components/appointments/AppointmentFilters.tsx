"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

interface AppointmentFiltersProps {
  onFilterChange: (filters: {
    status?: string;
    date?: string;
    search?: string;
  }) => void;
}

export default function AppointmentFilters({ onFilterChange }: AppointmentFiltersProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Aplicar filtros
  const handleFilterChange = (newFilters: any) => {
    const filters = {
      status: newFilters.status || status,
      date: newFilters.date || date,
      search: newFilters.search !== undefined ? newFilters.search : search
    };

    // Actualizar estados locales
    if (newFilters.status !== undefined) setStatus(newFilters.status);
    if (newFilters.date !== undefined) setDate(newFilters.date);
    if (newFilters.search !== undefined) setSearch(newFilters.search);

    // Emitir cambios
    onFilterChange(filters);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setStatus('');
    setDate('');
    setSearch('');
    onFilterChange({});
  };

  return (
    <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))] space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          🔍 {t('appointments.filters')}
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-[rgb(var(--primary))] hover:underline"
        >
          {t('common.clear') || 'Limpiar'}
        </button>
      </div>

      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          {t('common.search')}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
          placeholder={t('appointments.searchPlaceholder')}
          className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
        />
      </div>

      {/* Filtro por Estado */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          {t('appointments.status.all')}
        </label>
        <select
          value={status}
          onChange={(e) => handleFilterChange({ status: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
        >
          <option value="">{t('appointments.status.all')}</option>
          <option value="pending">{t('appointments.status.pending')}</option>
          <option value="confirmed">{t('appointments.status.confirmed')}</option>
          <option value="in-progress">{t('appointments.status.inProgress')}</option>
          <option value="completed">{t('appointments.status.completed')}</option>
          <option value="cancelled">{t('appointments.status.cancelled')}</option>
          <option value="no-show">{t('appointments.status.noShow')}</option>
        </select>
      </div>

      {/* Filtro por Fecha */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          {t('common.date')}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => handleFilterChange({ date: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
        />
      </div>

      {/* Filtros Rápidos */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          {t('common.quickFilters') || 'Filtros Rápidos'}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange({ date: new Date().toISOString().split('T')[0] })}
            className="px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.2)] transition-colors"
          >
            📅 {t('appointments.today')}
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              handleFilterChange({ date: tomorrow.toISOString().split('T')[0] });
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--info)/0.1)] text-[rgb(var(--info))] hover:bg-[rgb(var(--info)/0.2)] transition-colors"
          >
            ⏭️ {t('common.tomorrow') || 'Mañana'}
          </button>
          <button
            onClick={() => handleFilterChange({ status: 'pending' })}
            className="px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))] hover:bg-[rgb(var(--warning)/0.2)] transition-colors"
          >
            ⏳ {t('appointments.status.pending')}
          </button>
        </div>
      </div>
    </div>
  );
}