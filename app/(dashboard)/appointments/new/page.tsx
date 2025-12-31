'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { create } from '@/services/appointmentsService';
import { getAll as getAllPatients } from '@/services/patientsService';
import Link from 'next/link';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setDoctorId(userData._id);
    }
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await getAllPatients();
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    appointmentType: 'seguimiento',
    reasonForVisit: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await create({
        ...formData,
        doctorId,
        createdBy: doctorId,
      });

      alert(t('appointments.create.success') || 'Cita creada exitosamente');
      router.push('/appointments');
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      alert(error.response?.data?.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/appointments"
          className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{t('common.back')}</span>
        </Link>
        
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
          📅 {t('appointments.new.title') || 'Nueva Cita'}
        </h1>
      </div>

      {/* Formulario */}
      <div className="bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              {t('appointments.form.patient') || 'Paciente'} *
            </label>
            {loadingPatients ? (
              <p className="text-sm text-[rgb(var(--gray-medium))]">Cargando pacientes...</p>
            ) : (
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))]"
              >
                <option value="">Seleccionar paciente</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('appointments.form.date') || 'Fecha'} *
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('appointments.form.time') || 'Hora'} *
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))]"
              />
            </div>
          </div>

          {/* Duración y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('appointments.form.duration') || 'Duración (min)'}
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))]"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                {t('appointments.form.type') || 'Tipo de Cita'}
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))]"
              >
                <option value="primera-vez">Primera Vez</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="urgencia">Urgencia</option>
                <option value="control">Control</option>
                <option value="cirugia">Cirugía</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              {t('appointments.form.reason') || 'Motivo de Consulta'} *
            </label>
            <textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))] resize-none"
              placeholder="Describe el motivo de la consulta..."
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              {t('appointments.form.notes') || 'Notas Adicionales'}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-[rgb(var(--input-bg))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent text-[rgb(var(--foreground))] resize-none"
              placeholder="Notas opcionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-light))] text-[rgb(var(--foreground))] font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Creando...' : (t('appointments.create.button') || 'Crear Cita')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}