"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientsApi } from '@/lib/api';
import { Patient, PatientStats } from '@/types/patient';
import { FaPlus, FaSearch, FaFilter, FaUserPlus, FaEye } from 'react-icons/fa';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PatientsPage() {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar pacientes
  const loadPatients = async () => {
    // No hacer nada si no hay token
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10
      };

      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await patientsApi.getAll(params);
      setPatients(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    // No hacer nada si no hay token
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      return;
    }

    try {
      const response = await patientsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    // Solo cargar datos si está dentro de ProtectedRoute
    // (ProtectedRoute maneja la redirección)
    const timer = setTimeout(() => {
      loadPatients();
      loadStats();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  // Calcular edad
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[rgb(var(--background))] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          
         {/* Header */}
          <div className="mb-6">
            <Link
              href="/panel"
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t('print.back')}</span>
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                  {t('patients.title') || 'Pacientes'}
                </h1>
                <p className="text-[rgb(var(--gray-medium))] mt-1">
                  {t('patients.subtitle') || 'Gestiona tus pacientes'}
                </p>
              </div>
              
              <Link
                href="/patients/new"
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors shadow-md"
              >
                <FaUserPlus />
                <span>{t('patients.addNew') || 'Nuevo Paciente'}</span>
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-[rgb(var(--card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-xs md:text-sm">
                  {t('patients.stats.total') || 'Total'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[rgb(var(--foreground))] mt-1">
                  {stats.total}
                </p>
              </div>
              
              <div className="bg-[rgb(var(--card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-xs md:text-sm">
                  {t('patients.stats.active') || 'Activos'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[rgb(var(--success))] mt-1">
                  {stats.active}
                </p>
              </div>
              
              <div className="bg-[rgb(var(--card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-xs md:text-sm">
                  {t('patients.stats.inactive') || 'Inactivos'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[rgb(var(--warning))] mt-1">
                  {stats.inactive}
                </p>
              </div>
              
              <div className="bg-[rgb(var(--card))] rounded-lg p-3 md:p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-xs md:text-sm">
                  {t('patients.stats.newMonth') || 'Nuevos'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[rgb(var(--primary))] mt-1">
                  {stats.newThisMonth}
                </p>
              </div>
            </div>
          )}

          {/* Búsqueda y Filtros */}
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))] mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--gray-medium))]" />
                <input
                  type="text"
                  placeholder={t('patients.search') || 'Buscar pacientes...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              {/* Filtro por estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
              >
                <option value="all">{t('patients.filter.all') || 'Todos'}</option>
                <option value="active">{t('patients.filter.active') || 'Activos'}</option>
                <option value="inactive">{t('patients.filter.inactive') || 'Inactivos'}</option>
              </select>
            </div>
          </div>

          {/* Lista de Pacientes */}
          <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))]"></div>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[rgb(var(--gray-medium))]">
                  {t('patients.noResults') || 'No se encontraron pacientes'}
                </p>
              </div>
            ) : (
              <>
                {/* VISTA MÓVIL - Tarjetas */}
                <div className="block md:hidden divide-y divide-[rgb(var(--border))]">
                  {patients.map((patient) => (
                    <div 
                      key={patient._id}
                      className="p-4 hover:bg-[rgb(var(--background))] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-[rgb(var(--gray-medium))] truncate">
                            {patient.medicalRecordNumber}
                          </p>
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          patient.status === 'active' 
                            ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                            : 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]'
                        }`}>
                          {patient.status === 'active' 
                            ? t('patients.status.active') || 'Activo'
                            : t('patients.status.inactive') || 'Inactivo'
                          }
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-[rgb(var(--gray-medium))]">{t('patients.table.age') || 'Edad'}:</span>
                          <span className="ml-1 text-[rgb(var(--foreground))]">
                            {calculateAge(patient.dateOfBirth)} {t('patients.table.years') || 'años'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[rgb(var(--gray-medium))]">{t('patients.table.phone') || 'Tel'}:</span>
                          <span className="ml-1 text-[rgb(var(--foreground))]">{patient.phone}</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/patients/${patient._id}`}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors text-sm font-medium"
                      >
                        <FaEye />
                        <span>{t('patients.table.view') || 'Ver'}</span>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* VISTA TABLET Y DESKTOP - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[rgb(var(--background))] border-b border-[rgb(var(--border))]">
                      <tr>
                        <th className="text-left px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.record') || 'Expediente'}
                        </th>
                        <th className="text-left px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.name') || 'Nombre'}
                        </th>
                        <th className="text-left px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.age') || 'Edad'}
                        </th>
                        <th className="text-left px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.phone') || 'Teléfono'}
                        </th>
                        <th className="text-left px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.status') || 'Estado'}
                        </th>
                        <th className="text-left px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium text-[rgb(var(--gray-medium))] w-24 xl:w-32">
                          {t('patients.table.actions') || 'Acciones'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr 
                          key={patient._id}
                          className="border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--background))] transition-colors"
                        >
                          <td className="px-3 xl:px-6 py-4 text-xs xl:text-sm text-[rgb(var(--foreground))]">
                            {patient.medicalRecordNumber}
                          </td>
                          <td className="px-3 xl:px-6 py-4">
                            <div>
                              <p className="text-xs xl:text-sm font-medium text-[rgb(var(--foreground))]">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-xs text-[rgb(var(--gray-medium))] truncate max-w-[120px] xl:max-w-none">
                                {patient.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 xl:px-6 py-4 text-xs xl:text-sm text-[rgb(var(--foreground))] whitespace-nowrap">
                            {calculateAge(patient.dateOfBirth)} {t('patients.table.years') || 'años'}
                          </td>
                          <td className="px-3 xl:px-6 py-4 text-xs xl:text-sm text-[rgb(var(--foreground))]">
                            {patient.phone}
                          </td>
                          <td className="px-3 xl:px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                              patient.status === 'active' 
                                ? 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]'
                                : 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]'
                            }`}>
                              {patient.status === 'active' 
                                ? t('patients.status.active') || 'Activo'
                                : t('patients.status.inactive') || 'Inactivo'
                              }
                            </span>
                          </td>
                          <td className="px-3 xl:px-6 py-4">
                            <Link
                              href={`/patients/${patient._id}`}
                              className="inline-flex items-center justify-center gap-1 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] text-xs xl:text-sm font-medium"
                              title={t('patients.table.view') || 'Ver'}
                            >
                              <FaEye className="text-base xl:text-sm" />
                              <span className="hidden xl:inline">{t('patients.table.view') || 'Ver'}</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-[rgb(var(--border))]">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-[rgb(var(--foreground))] bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.previous') || 'Anterior'}
                    </button>
                    
                    <span className="text-xs md:text-sm text-[rgb(var(--gray-medium))]">
                      {page} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-[rgb(var(--foreground))] bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.next') || 'Siguiente'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}