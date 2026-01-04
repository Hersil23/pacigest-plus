'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';

interface Prescription {
  prescriptionNumber: string;
  prescriptionDate: string;
  patientId: {
    firstName: string;
    lastName: string;
    identificationType: string;
    identificationNumber: string;
    dateOfBirth: string;
  };
  doctorId: {
    firstName: string;
    lastName: string;
    specialty: string;
    licenseNumber: string;
    phone: string;
    clinic?: {
      name?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
      };
      phone?: string;
    };
  };
  medications: Array<{
    instructions: string;
  }>;
  generalInstructions: string;
}

export default function PrescriptionPrintPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const prescriptionId = params.id as string;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err) {
      console.error('Error loading prescription:', err);
      setError(t('prescriptions.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'white' }}>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 mb-4">{error || t('prescriptions.error')}</p>
          <button
            onClick={() => router.push('/recipe')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 8mm;
          }
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10pt;
          }
        }
        @page {
          size: letter;
          margin: 8mm;
        }
      `}</style>

      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        {/* No Print - Back and Print Buttons */}
        <div className="no-print" style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '210mm', margin: '0 auto', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <FaArrowLeft />
              {t('common.back')}
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <FaPrint />
              {t('prescriptions.print')}
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="print-container" style={{ maxWidth: '210mm', margin: '1rem auto', padding: '0 1rem' }}>
          
          {/* Header - Solo línea divisoria */}
          <div style={{ marginBottom: '0.75rem', borderBottom: '2px solid #3b82f6' }}></div>

          {/* Prescription Number and Date */}
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
                {t('prescriptions.prescriptionNumber')}
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937', margin: '0.1rem 0' }}>
                {prescription.prescriptionNumber}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
                {t('prescriptions.prescriptionDate')}
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937', margin: '0.1rem 0' }}>
                {formatDate(prescription.prescriptionDate)}
              </p>
            </div>
          </div>

          {/* Patient Information */}
          <div style={{ marginBottom: '0.75rem', padding: '0.4rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.3rem' }}>
              {t('prescriptions.patient')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.8rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>{t('common.name')}</p>
                <p style={{ fontSize: '0.8rem', color: '#1f2937', margin: '0.05rem 0', fontWeight: '600' }}>
                  {prescription.patientId.firstName} {prescription.patientId.lastName}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
                  {prescription.patientId.identificationType}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#1f2937', margin: '0.05rem 0', fontWeight: '600' }}>
                  {prescription.patientId.identificationNumber}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>{t('patientDetail.age')}</p>
                <p style={{ fontSize: '0.8rem', color: '#1f2937', margin: '0.05rem 0', fontWeight: '600' }}>
                  {calculateAge(prescription.patientId.dateOfBirth)} {t('patientDetail.years')}
                </p>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div style={{ marginBottom: '0.75rem' }}>
            <h2 style={{
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.3rem',
              paddingBottom: '0.2rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {t('prescriptions.medications')}
            </h2>
            <div style={{
              fontSize: '0.85rem',
              color: '#1f2937',
              lineHeight: '1.3',
              whiteSpace: 'pre-wrap',
              padding: '0.4rem',
              backgroundColor: '#fefefe',
              border: '1px solid #e5e7eb',
              borderRadius: '0.25rem'
            }}>
              {prescription.medications[0]?.instructions || '---'}
            </div>
          </div>

          {/* General Instructions */}
          {prescription.generalInstructions && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h2 style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.3rem',
                paddingBottom: '0.2rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {t('prescriptions.indications')}
              </h2>
              <div style={{
                fontSize: '0.85rem',
                color: '#1f2937',
                lineHeight: '1.3',
                whiteSpace: 'pre-wrap',
                padding: '0.4rem',
                backgroundColor: '#fefefe',
                border: '1px solid #e5e7eb',
                borderRadius: '0.25rem'
              }}>
                {prescription.generalInstructions}
              </div>
            </div>
          )}

          {/* Doctor Signature - CON TODA LA INFORMACIÓN */}
          <div style={{ marginTop: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '180px',
                height: '30px',
                margin: '0 auto 0.2rem',
                borderBottom: '1px solid #1f2937'
              }} />
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', margin: '0.15rem 0' }}>
                Dr(a). {prescription.doctorId.firstName} {prescription.doctorId.lastName}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0.1rem 0' }}>
                {prescription.doctorId.specialty}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0.1rem 0' }}>
                {t('prescriptions.licenseNumber')}: {prescription.doctorId.licenseNumber}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0.1rem 0' }}>
                Tel: {prescription.doctorId.phone}
              </p>
              {prescription.doctorId.clinic?.name && (
                <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0.1rem 0' }}>
                  {prescription.doctorId.clinic.name}
                </p>
              )}
              {prescription.doctorId.clinic?.address?.street && (
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0.1rem 0' }}>
                  {prescription.doctorId.clinic.address.street}, {prescription.doctorId.clinic.address.city}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}