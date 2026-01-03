'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    patient: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching patients');
      
      const data = await response.json();
      setPatients(data.data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(t('appointments.errorLoadingPatients'));
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar campos requeridos
    if (!formData.patient || !formData.date || !formData.time || !formData.reason) {
      setError(t('appointments.fillRequiredFields'));
      setLoading(false);
      return;
    }

   // Validar que la fecha no sea en el pasado
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayString = `${year}-${month}-${day}`;

if (formData.date < todayString) {
  setError(language === 'es' ? 'No puedes crear citas en fechas pasadas' : 'You cannot create appointments in past dates');
  setLoading(false);
  return;
}

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const appointmentData = {
        patientId: formData.patient,
        doctorId: user._id || user.id,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        reasonForVisit: formData.reason,
        notes: formData.notes || undefined
      };

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating appointment');
      }

      router.push('/appointments');
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message || t('appointments.errorCreatingAppointment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'rgb(var(--card))' }}>
          {/* Header con botón Back */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgb(var(--card))',
                color: 'rgb(var(--foreground))',
                borderWidth: '1px',
                borderColor: 'rgb(var(--border))'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('common.back')}
            </button>

            <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
              {t('appointments.createAppointment')}
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: '1px',
              borderColor: 'rgb(var(--error))'
            }}>
              <p style={{ color: 'rgb(var(--error))' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Select */}
            <div>
              <label htmlFor="patient" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.form.patient')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <select
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleInputChange}
                disabled={loadingPatients}
                required
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              >
                <option value="">
                  {loadingPatients ? t('common.loading') : t('appointments.selectPatient')}
                </option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} - {patient.identificationType} {patient.identificationNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('common.date')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              />
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('common.time')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.form.reason')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                placeholder={t('appointments.appointmentReason')}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all placeholder:opacity-50"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              />
            </div>

            {/* Notes (Optional) */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.form.notes')} <span className="text-xs opacity-60">({t('appointments.optional')})</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder={t('appointments.additionalNotes')}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none resize-none transition-all placeholder:opacity-50"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))',
                  '--tw-ring-color': 'rgb(var(--primary))'
                } as React.CSSProperties}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgb(var(--gray-very-light))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))'
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || loadingPatients}
                className="flex-1 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'rgb(var(--primary))'
                }}
              >
                {loading ? t('appointments.creating') : t('appointments.createAppointment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}