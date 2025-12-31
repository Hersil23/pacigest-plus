"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import StatusBadge from './StatusBadge';
import Link from 'next/link';
import { FaEye, FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

interface AppointmentCardProps {
  appointment: {
    _id: string;
    appointmentNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    status: string;
    reasonForVisit: string;
    patientId: {
      _id: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function AppointmentCard({ 
  appointment, 
  onConfirm, 
  onCancel, 
  onDelete 
}: AppointmentCardProps) {
  const { t } = useLanguage();

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[rgb(var(--card))] rounded-lg p-4 border border-[rgb(var(--border))] hover:shadow-md transition-all">
      
      {/* Header: Hora + Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-[rgb(var(--primary))]">
              {appointment.appointmentTime}
            </p>
            <p className="text-xs text-[rgb(var(--gray-medium))]">
              {appointment.duration} {t('appointments.minutes')}
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>

      {/* Información del Paciente */}
      <div className="mb-3">
        <Link 
          href={`/patients/${appointment.patientId._id}`}
          className="text-lg font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {appointment.patientId.firstName} {appointment.patientId.lastName}
        </Link>
        {appointment.patientId.phone && (
          <p className="text-sm text-[rgb(var(--gray-medium))] mt-1">
            📞 {appointment.patientId.phone}
          </p>
        )}
      </div>

      {/* Fecha y Motivo */}
      <div className="space-y-2 mb-3">
        <p className="text-sm text-[rgb(var(--gray-medium))]">
          📅 {formatDate(appointment.appointmentDate)}
        </p>
        <p className="text-sm text-[rgb(var(--foreground))] line-clamp-2">
          📋 {appointment.reasonForVisit}
        </p>
      </div>

      {/* Número de Cita */}
      <p className="text-xs text-[rgb(var(--gray-medium))] mb-3">
        #{appointment.appointmentNumber}
      </p>

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-3 border-t border-[rgb(var(--border))]">
        
        {/* Ver */}
        <Link
          href={`/appointments/${appointment._id}`}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.2)] transition-colors"
        >
          <FaEye className="text-xs" />
          <span>{t('common.view')}</span>
        </Link>

        {/* Confirmar (solo si está pendiente) */}
        {appointment.status === 'pending' && onConfirm && (
          <button
            onClick={() => onConfirm(appointment._id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))] hover:bg-[rgb(var(--success)/0.2)] transition-colors"
            title={t('appointments.confirmAppointment')}
          >
            <FaCheck className="text-xs" />
          </button>
        )}

        {/* Cancelar (solo si no está cancelada o completada) */}
        {!['cancelled', 'completed'].includes(appointment.status) && onCancel && (
          <button
            onClick={() => onCancel(appointment._id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.2)] transition-colors"
            title={t('appointments.cancelAppointment')}
          >
            <FaTimes className="text-xs" />
          </button>
        )}

        {/* Eliminar */}
        {onDelete && (
          <button
            onClick={() => onDelete(appointment._id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--gray-medium)/0.1)] text-[rgb(var(--gray-medium))] hover:bg-[rgb(var(--gray-medium)/0.2)] transition-colors ml-auto"
            title={t('common.delete')}
          >
            <FaTrash className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
}