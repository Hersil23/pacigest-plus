'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaArrowLeft } from 'react-icons/fa';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
  medicalRecordNumber: string;
}

export default function NewPrescriptionPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    medications: '',
    generalInstructions: ''
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

    if (!formData.patientId || !formData.medications) {
      setError(t('appointments.fillRequiredFields'));
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const prescriptionData = {
        patientId: formData.patientId,
        doctorId: user._id || user.id,
        prescriptionDate: formData.prescriptionDate,
        medications: [{
          name: 'Texto libre',
          dosage: '---',
          frequency: '---',
          duration: '---',
          instructions: formData.medications
        }],
        generalInstructions: formData.generalInstructions
      };

      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating prescription');
      }

      alert(t('prescriptions.created'));
      router.push('/recipe');
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      setError(err.message || t('prescriptions.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'rgb(var(--card))' }}>
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
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

            <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
              {t('prescriptions.new')}
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
              <label htmlFor="patientId" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.patient')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                disabled={loadingPatients}
                required
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none disabled:opacity-50"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))'
                }}
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
              <label htmlFor="prescriptionDate" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.prescriptionDate')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <input
                type="date"
                id="prescriptionDate"
                name="prescriptionDate"
                value={formData.prescriptionDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))'
                }}
              />
            </div>

            {/* Medications */}
            <div>
              <label htmlFor="medications" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.medications')} <span style={{ color: 'rgb(var(--error))' }}>*</span>
              </label>
              <textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                required
                rows={8}
                placeholder={t('prescriptions.medicationsPlaceholder')}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none resize-none"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))'
                }}
              />
            </div>

            {/* General Instructions */}
            <div>
              <label htmlFor="generalInstructions" className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.indications')}
              </label>
              <textarea
                id="generalInstructions"
                name="generalInstructions"
                value={formData.generalInstructions}
                onChange={handleInputChange}
                rows={6}
                placeholder={t('prescriptions.indicationsPlaceholder')}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none resize-none"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  borderWidth: '1px',
                  borderColor: 'rgb(var(--border))'
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-all hover:opacity-80"
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
                className="flex-1 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--primary))' }}
              >
                {loading ? t('prescriptions.creating') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}