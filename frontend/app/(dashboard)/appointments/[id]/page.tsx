'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaCalendar, FaClock, FaUser, FaEdit, FaTrash, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';

interface Appointment {
  _id: string;
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  status: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Form state para edición
  const [editForm, setEditForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reasonForVisit: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching appointment');

      const data = await response.json();
      setAppointment(data.data);
      
      // Inicializar form con datos actuales
      setEditForm({
        appointmentDate: data.data.appointmentDate.split('T')[0],
        appointmentTime: data.data.appointmentTime,
        reasonForVisit: data.data.reasonForVisit,
        notes: data.data.notes || ''
      });
    } catch (err) {
      console.error('Error loading appointment:', err);
      setError(t('appointments.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!response.ok) throw new Error('Error confirming appointment');

      await fetchAppointment();
      alert(t('appointments.confirmed'));
    } catch (err) {
      console.error('Error confirming appointment:', err);
      alert(t('appointmentActions.error'));
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) throw new Error('Error cancelling appointment');

      setShowCancelConfirm(false);
      await fetchAppointment();
      alert(t('appointments.cancelled'));
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(t('appointmentActions.error'));
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error deleting appointment');

      alert(t('appointments.deleted'));
      router.push('/appointments');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert(t('appointmentActions.error'));
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Error updating appointment');

      setIsEditing(false);
      await fetchAppointment();
      alert(t('appointments.updated'));
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert(t('appointmentActions.error'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'rgb(234, 179, 8)',
      'confirmed': 'rgb(34, 197, 94)',
      'in-progress': 'rgb(59, 130, 246)',
      'completed': 'rgb(156, 163, 175)',
      'cancelled': 'rgb(239, 68, 68)',
      'no-show': 'rgb(249, 115, 22)'
    };
    return colors[status as keyof typeof colors] || 'rgb(156, 163, 175)';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <p style={{ color: 'rgb(var(--foreground))' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: '1px', borderColor: 'rgb(var(--error))' }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error || t('appointments.error')}</p>
          </div>
          <button
            onClick={() => router.push('/appointments')}
            className="mt-4 px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/appointments')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all hover:opacity-80"
          style={{
            backgroundColor: 'rgb(var(--card))',
            color: 'rgb(var(--foreground))',
            borderWidth: '1px',
            borderColor: 'rgb(var(--border))'
          }}
        >
          <FaArrowLeft />
          {t('common.back')}
        </button>

        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
              {t('appointments.details')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
              #{appointment.appointmentNumber}
            </p>
          </div>
          <span
            className="px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: getStatusColor(appointment.status) }}
          >
            {t(`appointments.status.${appointment.status}`)}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
          
          {isEditing ? (
            /* MODO EDICIÓN */
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.edit')}
              </h2>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('appointments.form.date')}
                </label>
                <input
                  type="date"
                  value={editForm.appointmentDate}
                  onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('appointments.form.time')}
                </label>
                <input
                  type="time"
                  value={editForm.appointmentTime}
                  onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('appointments.reason')}
                </label>
                <textarea
                  value={editForm.reasonForVisit}
                  onChange={(e) => setEditForm({ ...editForm, reasonForVisit: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('appointments.notes')}
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  placeholder={t('appointments.notesPlaceholder')}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Botones de edición */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgb(var(--success))' }}
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgb(var(--card))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            /* MODO VISTA */
            <div className="space-y-6">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                    <FaCalendar />
                    <span className="text-sm">{t('appointments.date')}</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                    {formatDate(appointment.appointmentDate)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                    <FaClock />
                    <span className="text-sm">{t('appointments.time')}</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                    {appointment.appointmentTime}
                  </p>
                </div>
              </div>

              {/* Paciente */}
              <div>
                <div className="flex items-center gap-2 mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  <FaUser />
                  <span className="text-sm">{t('appointments.patient')}</span>
                </div>
                <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {appointment.patientId.firstName} {appointment.patientId.lastName}
                </p>
                {appointment.patientId.phone && (
                  <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                    📞 {appointment.patientId.phone}
                  </p>
                )}
                {appointment.patientId.email && (
                  <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                    ✉️ {appointment.patientId.email}
                  </p>
                )}
              </div>

              {/* Motivo */}
              <div>
                <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('appointments.reason')}
                </p>
                <p style={{ color: 'rgb(var(--foreground))' }}>
                  {appointment.reasonForVisit}
                </p>
              </div>

              {/* Notas */}
              {appointment.notes && (
                <div>
                  <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                    {t('appointments.notes')}
                  </p>
                  <p style={{ color: 'rgb(var(--foreground))' }}>
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Editar */}
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(var(--info))' }}
            >
              <FaEdit />
              {t('common.edit')}
            </button>

            {/* Confirmar */}
            {appointment.status !== 'confirmed' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <button
                onClick={handleConfirm}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
                style={{ backgroundColor: 'rgb(var(--success))' }}
              >
                <FaCheck />
                {t('common.confirm')}
              </button>
            )}

            {/* Cancelar */}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
                style={{ backgroundColor: 'rgb(var(--warning))' }}
              >
                <FaTimes />
                {t('appointments.cancelAppointment')}
              </button>
            )}

            {/* Eliminar */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(var(--error))' }}
            >
              <FaTrash />
              {t('common.delete')}
            </button>
          </div>
        )}

        {/* Modal Confirmación Cancelar */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: 'rgb(var(--card))' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.confirmCancel')}
              </h3>
              <p className="mb-6" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('appointments.confirmCancel')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgb(var(--warning))' }}
                >
                  {t('common.yes')}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                >
                  {t('common.no')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmación Eliminar */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: 'rgb(var(--card))' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.confirmDelete')}
              </h3>
              <p className="mb-6" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('appointments.confirmDelete')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgb(var(--error))' }}
                >
                  {t('common.yes')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                >
                  {t('common.no')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}