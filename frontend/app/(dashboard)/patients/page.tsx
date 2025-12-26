"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientsApi } from '@/lib/api';
import { Patient, PatientStats } from '@/types/patient';
import { FaPlus, FaSearch, FaFilter, FaUserPlus } from 'react-icons/fa';
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
      <div className="min-h-screen bg-[rgb(var(--background))] p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-sm">
                  {t('patients.stats.total') || 'Total'}
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">
                  {stats.total}
                </p>
              </div>
              
              <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-sm">
                  {t('patients.stats.active') || 'Activos'}
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--success))] mt-1">
                  {stats.active}
                </p>
              </div>
              
              <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-sm">
                  {t('patients.stats.inactive') || 'Inactivos'}
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--warning))] mt-1">
                  {stats.inactive}
                </p>
              </div>
              
              <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--gray-medium))] text-sm">
                  {t('patients.stats.newMonth') || 'Nuevos este mes'}
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--primary))] mt-1">
                  {stats.newThisMonth}
                </p>
              </div>
            </div>
          )}

          {/* Búsqueda y Filtros */}
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))] mb-6">
            <div className="flex flex-col md:flex-row gap-4">
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
                className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
              >
                <option value="all">{t('patients.filter.all') || 'Todos'}</option>
                <option value="active">{t('patients.filter.active') || 'Activos'}</option>
                <option value="inactive">{t('patients.filter.inactive') || 'Inactivos'}</option>
              </select>
            </div>
          </div>

          {/* Tabla de Pacientes */}
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[rgb(var(--background))] border-b border-[rgb(var(--border))]">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.record') || 'Expediente'}
                        </th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.name') || 'Nombre'}
                        </th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.age') || 'Edad'}
                        </th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.phone') || 'Teléfono'}
                        </th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-[rgb(var(--gray-medium))]">
                          {t('patients.table.status') || 'Estado'}
                        </th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-[rgb(var(--gray-medium))]">
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
                          <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                            {patient.medicalRecordNumber}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-xs text-[rgb(var(--gray-medium))]">
                                {patient.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                            {calculateAge(patient.dateOfBirth)} {t('patients.table.years') || 'años'}
                          </td>
                          <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                          <td className="px-6 py-4">
                            <Link
                              href={`/patients/${patient._id}`}
                              className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] text-sm font-medium"
                            >
                              {t('patients.table.view') || 'Ver'}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[rgb(var(--border))]">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-[rgb(var(--foreground))] bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.previous') || 'Anterior'}
                    </button>
                    
                    <span className="text-sm text-[rgb(var(--gray-medium))]">
                      {t('common.page') || 'Página'} {page} {t('common.of') || 'de'} {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-medium text-[rgb(var(--foreground))] bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] disabled:opacity-50 disabled:cursor-not-allowed"
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