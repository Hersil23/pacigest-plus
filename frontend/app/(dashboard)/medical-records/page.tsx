'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaArrowLeft, FaPlus, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';

interface MedicalReport {
  _id: string;
  consultationDate: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes: string;
}

export default function MedicalReportsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = user._id || user.id;

      const response = await fetch(`http://localhost:5000/api/medical-records/doctor/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching reports');

      const data = await response.json();
      setReports(data.data || []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(t('medicalReports.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('medicalReports.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error deleting report');

      alert(t('medicalReports.deleted'));
      fetchReports();
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
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
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
              {t('medicalReports.title')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
              {t('medicalReports.subtitle')}
            </p>
          </div>

          <button
            onClick={() => router.push('/medical-records/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgb(var(--primary))' }}
          >
            <FaPlus />
            {t('medicalReports.new')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: '1px',
            borderColor: 'rgb(var(--error))'
          }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error}</p>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
            <p style={{ color: 'rgb(var(--gray-medium))' }}>{t('medicalReports.noReports')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="p-4 rounded-lg shadow-sm transition-all hover:shadow-md"
                style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                      {report.patientId.firstName} {report.patientId.lastName}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                      {formatDate(report.consultationDate)}
                    </p>
                    <p className="text-sm line-clamp-2" style={{ color: 'rgb(var(--gray-dark))' }}>
                      {report.notes?.substring(0, 150)}...
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/medical-records/${report._id}/print`)}
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
                      title={t('medicalReports.print')}
                    >
                      <FaPrint />
                    </button>
                    <button
                      onClick={() => router.push(`/medical-records/${report._id}`)}
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgb(var(--info))', color: 'white' }}
                      title={t('common.edit')}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(report._id)}
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
  );
}