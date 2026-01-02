'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { create } from '@/services/appointmentsService';
import { getAll as getAllPatients } from '@/services/patientsService';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Obtener doctorId del usuario logueado
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
  // Cargar doctorId del localStorage
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('👤 Usuario desde localStorage:', userData);
      console.log('🆔 Doctor ID:', userData._id);
      setDoctorId(userData._id);
    } catch (error) {
      console.error('Error parsing user:', error);
    }
  } else {
    console.error('❌ No hay usuario en localStorage');
  }

  // Cargar pacientes
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

  console.log('🔵 1. DoctorId al enviar:', doctorId);
  console.log('🔵 2. FormData completo:', formData);
  console.log('🔵 3. Datos a enviar:', {
    ...formData,
    doctorId,
    createdBy: doctorId,
  });

  try {
    await create({
      ...formData,
      doctorId,
      createdBy: doctorId,
    });

    alert(t('appointments.create.success') || 'Cita creada exitosamente');
    router.push('/appointments');
  } catch (error: any) {
    console.error('❌ Error creating appointment:', error);
    console.error('❌ Error response:', error.response?.data);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('appointments.new.title') || 'Nueva Cita'}
        </h1>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('appointments.form.patient') || 'Paciente'} *
            </label>
            {loadingPatients ? (
              <p className="text-sm text-gray-500">Cargando pacientes...</p>
            ) : (
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('appointments.form.date') || 'Fecha'} *
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('appointments.form.time') || 'Hora'} *
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Duración y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('appointments.form.duration') || 'Duración (min)'}
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('appointments.form.type') || 'Tipo de Cita'}
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('appointments.form.reason') || 'Motivo de Consulta'} *
            </label>
            <textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe el motivo de la consulta..."
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('appointments.form.notes') || 'Notas Adicionales'}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Notas opcionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : (t('appointments.create.button') || 'Crear Cita')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}