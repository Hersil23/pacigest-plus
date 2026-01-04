'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaArrowLeft, FaEdit, FaPrint, FaTrash } from 'react-icons/fa';

interface Prescription {
  _id: string;
  prescriptionNumber: string;
  prescriptionDate: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    identificationType: string;
    identificationNumber: string;
  };
  medications: Array<{
    instructions: string;
  }>;
  generalInstructions: string;
}

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const prescriptionId = params.id as string;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    prescriptionDate: '',
    medications: '',
    generalInstructions: ''
  });

  useEffect(() => {
    fetchPrescription();
  }, [prescriptionId]);

  const fetchPrescription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching prescription');

      const data = await response.json();
      setPrescription(data.data);

      setEditForm({
        prescriptionDate: data.data.prescriptionDate.split('T')[0],
        medications: data.data.medications[0]?.instructions || '',
        generalInstructions: data.data.generalInstructions || ''
      });
    } catch (err) {
      console.error('Error loading prescription:', err);
      setError(t('prescriptions.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');

      const updateData = {
        prescriptionDate: editForm.prescriptionDate,
        medications: [{
          name: 'Texto libre',
          dosage: '---',
          frequency: '---',
          duration: '---',
          instructions: editForm.medications
        }],
        generalInstructions: editForm.generalInstructions
      };

      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Error updating prescription');

      setIsEditing(false);
      await fetchPrescription();
      alert(t('prescriptions.updated'));
    } catch (err) {
      console.error('Error updating prescription:', err);
      alert(t('prescriptions.error'));
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error deleting prescription');

      alert(t('prescriptions.deleted'));
      router.push('/recipe');
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

  if (error || !prescription) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: '1px', borderColor: 'rgb(var(--error))' }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error || t('prescriptions.error')}</p>
          </div>
          <button
            onClick={() => router.push('/recipe')}
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
          onClick={() => router.push('/recipe')}
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
              {isEditing ? t('prescriptions.edit') : t('prescriptions.view')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
              {prescription.prescriptionNumber}
            </p>
          </div>
        </div>

        {/* Prescription Details */}
        <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
          
          {isEditing ? (
            /* MODO EDICIÓN */
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.edit')}
              </h2>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('prescriptions.prescriptionDate')}
                </label>
                <input
                  type="date"
                  value={editForm.prescriptionDate}
                  onChange={(e) => setEditForm({ ...editForm, prescriptionDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Medications */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('prescriptions.medications')}
                </label>
                <textarea
                  value={editForm.medications}
                  onChange={(e) => setEditForm({ ...editForm, medications: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* General Instructions */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('prescriptions.indications')}
                </label>
                <textarea
                  value={editForm.generalInstructions}
                  onChange={(e) => setEditForm({ ...editForm, generalInstructions: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Buttons */}
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
              {/* Patient */}
              <div>
                <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('prescriptions.patient')}
                </p>
                <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {prescription.patientId.firstName} {prescription.patientId.lastName}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {prescription.patientId.identificationType}: {prescription.patientId.identificationNumber}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('prescriptions.prescriptionDate')}
                </p>
                <p style={{ color: 'rgb(var(--foreground))' }}>
                  {formatDate(prescription.prescriptionDate)}
                </p>
              </div>

              {/* Medications */}
              <div>
                <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('prescriptions.medications')}
                </p>
                <p className="whitespace-pre-wrap" style={{ color: 'rgb(var(--foreground))' }}>
                  {prescription.medications[0]?.instructions || '---'}
                </p>
              </div>

              {/* General Instructions */}
              {prescription.generalInstructions && (
                <div>
                  <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                    {t('prescriptions.indications')}
                  </p>
                  <p className="whitespace-pre-wrap" style={{ color: 'rgb(var(--foreground))' }}>
                    {prescription.generalInstructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(var(--info))' }}
            >
              <FaEdit />
              {t('common.edit')}
            </button>

            <button
              onClick={() => router.push(`/recipe/${prescriptionId}/print`)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              <FaPrint />
              {t('prescriptions.print')}
            </button>

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

        {/* Modal Delete Confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: 'rgb(var(--card))' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                {t('prescriptions.confirmDelete')}
              </h3>
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