'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaArrowLeft, FaEdit, FaPrint, FaTrash } from 'react-icons/fa';

interface MedicalReport {
  _id: string;
  consultationDate: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    identificationType: string;
    identificationNumber: string;
  };
  notes: string;
}

export default function MedicalReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const reportId = params.id as string;

  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    consultationDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-records/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching report');

      const data = await response.json();
      setReport(data.data);

      setEditForm({
        consultationDate: data.data.consultationDate.split('T')[0],
        notes: data.data.notes || ''
      });
    } catch (err) {
      console.error('Error loading report:', err);
      setError(t('medicalReports.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');

      const updateData = {
        consultationDate: editForm.consultationDate,
        notes: editForm.notes
      };

      const response = await fetch(`http://localhost:5000/api/medical-records/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Error updating report');

      setIsEditing(false);
      await fetchReport();
      alert(t('medicalReports.updated'));
    } catch (err) {
      console.error('Error updating report:', err);
      alert(t('medicalReports.error'));
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-records/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error deleting report');

      alert(t('medicalReports.deleted'));
      router.push('/medical-records');
    } catch (err) {
      console.error('Error deleting report:', err);
      alert(t('medicalReports.error'));
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

  if (error || !report) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: '1px', borderColor: 'rgb(var(--error))' }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error || t('medicalReports.error')}</p>
          </div>
          <button
            onClick={() => router.push('/medical-records')}
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
          onClick={() => router.push('/medical-records')}
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
            {isEditing ? t('medicalReports.edit') : t('medicalReports.view')}
          </h1>
        </div>

        {/* Report Details */}
        <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
          
          {isEditing ? (
            /* MODO EDICIÓN */
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                {t('medicalReports.edit')}
              </h2>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('medicalReports.reportDate')}
                </label>
                <input
                  type="date"
                  value={editForm.consultationDate}
                  onChange={(e) => setEditForm({ ...editForm, consultationDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                    borderWidth: '1px',
                    borderColor: 'rgb(var(--border))'
                  }}
                />
              </div>

              {/* Medical Report */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  {t('medicalReports.medicalReport')}
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={20}
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
                  {t('medicalReports.patient')}
                </p>
                <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  {report.patientId.firstName} {report.patientId.lastName}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {report.patientId.identificationType}: {report.patientId.identificationNumber}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('medicalReports.reportDate')}
                </p>
                <p style={{ color: 'rgb(var(--foreground))' }}>
                  {formatDate(report.consultationDate)}
                </p>
              </div>

              {/* Medical Report */}
              <div>
                <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {t('medicalReports.medicalReport')}
                </p>
                <p className="whitespace-pre-wrap" style={{ color: 'rgb(var(--foreground))' }}>
                  {report.notes || '---'}
                </p>
              </div>
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
              onClick={() => router.push(`/medical-records/${reportId}/print`)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              <FaPrint />
              {t('medicalReports.print')}
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
                {t('medicalReports.confirmDelete')}
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