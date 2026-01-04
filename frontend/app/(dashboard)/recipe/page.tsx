'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaPlus, FaEye, FaEdit, FaTrash, FaPrint, FaArrowLeft } from 'react-icons/fa';

interface Prescription {
  _id: string;
  prescriptionNumber: string;
  prescriptionDate: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    medicalRecordNumber: string;
  };
  status: string;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`http://localhost:5000/api/prescriptions/doctor/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching prescriptions');

      const data = await response.json();
      setPrescriptions(data.data || []);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
      setError(t('prescriptions.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('prescriptions.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/prescriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error deleting prescription');

      alert(t('prescriptions.deleted'));
      fetchPrescriptions();
    } catch (err) {
      console.error('Error deleting prescription:', err);
      alert(t('prescriptions.error'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/panel')}
            className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all hover:opacity-80"
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

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.title')}
              </h1>
              <p className="mt-1" style={{ color: 'rgb(var(--foreground))', opacity: 0.7 }}>
                {t('prescriptions.subtitle')}
              </p>
            </div>
            <button
              onClick={() => router.push('/recipe/new')}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              <FaPlus />
              {t('prescriptions.new')}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: '1px',
            borderColor: 'rgb(var(--error))'
          }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error}</p>
          </div>
        )}

        {/* Prescriptions List */}
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'rgb(var(--card))' }}>
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('prescriptions.noPrescriptions')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="p-4 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: 'rgb(var(--background))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg" style={{ color: 'rgb(var(--foreground))' }}>
                        {prescription.patientId.firstName} {prescription.patientId.lastName}
                      </p>
                      <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                        {t('prescriptions.prescriptionNumber')}: {prescription.prescriptionNumber}
                      </p>
                      <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                        {formatDate(prescription.prescriptionDate)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/recipe/${prescription._id}/print`)}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: 'rgb(var(--info))', color: 'white' }}
                        title={t('prescriptions.print')}
                      >
                        <FaPrint />
                      </button>
                      <button
                        onClick={() => router.push(`/recipe/${prescription._id}`)}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
                        title={t('prescriptions.edit')}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(prescription._id)}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: 'rgb(var(--error))', color: 'white' }}
                        title={t('common.delete')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}