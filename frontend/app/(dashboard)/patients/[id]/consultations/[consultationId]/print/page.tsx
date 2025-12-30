"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientsApi, consultationsApi, authApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Patient {
  _id: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  medicalRecordNumber: string;
  dateOfBirth: string;
  age?: number;
  gender: 'M' | 'F';
  bloodType: string;
  phone: string;
  email: string;
}

interface Consultation {
  _id: string;
  consultationDate: string;
  reason: string;
  symptoms: string;
  symptomsDuration: string;
  doctorNotes: string;
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
}

interface Doctor {
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber?: string;
  email: string;
  phone?: string;
}

export default function PrintConsultationPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-print cuando todo está cargado
    if (!loading && patient && consultation && doctor) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, patient, consultation, doctor]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar doctor actual
      const doctorData = await authApi.getCurrentUser();
      setDoctor(doctorData);

      // Cargar paciente
      const patientResponse = await patientsApi.getById(params.id as string);
      setPatient(patientResponse.data);

      // Cargar consulta
      const consultationResponse = await consultationsApi.getById(
        params.id as string,
        params.consultationId as string
      );
      setConsultation(consultationResponse.data);

    } catch (err: any) {
      setError(err.message || 'Error al cargar información');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{t('print.preparing')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !patient || !consultation || !doctor) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">❌ {error || t('print.errorLoading')}</p>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline"
            >
              ← {t('print.back')}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="print-container">
        <style jsx global>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }

            .print-container {
              width: 100%;
              max-width: none;
              margin: 0;
              padding: 20mm;
            }

            @page {
              size: A4;
              margin: 15mm;
            }
          }

          @media screen {
            .print-container {
              max-width: 210mm;
              margin: 20px auto;
              padding: 20px;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
          }

          .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .header-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }

          .header-subtitle {
            font-size: 14px;
            color: #64748b;
          }

          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }

          .info-item {
            margin-bottom: 8px;
          }

          .info-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
          }

          .info-value {
            font-size: 14px;
            color: #1e293b;
          }

          .text-block {
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin-bottom: 10px;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }

          .vital-signs-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .vital-sign-box {
            background: #f0f9ff;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #bae6fd;
          }

          .no-print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 9999;
            font-size: 14px;
          }

          .no-print-button:hover {
            background: #1d4ed8;
            transform: scale(1.05);
          }
        `}</style>

        {/* Botón Volver CORREGIDO */}
        <button
          onClick={() => window.close()}
          className="no-print no-print-button"
        >
          ← {t('print.back')}
        </button>

        {/* Header / Membrete */}
        <div className="header">
          <div className="header-title">PaciGest Plus</div>
          <div className="header-subtitle">
            {doctor.specialty} • Dr(a). {doctor.firstName} {doctor.lastName}
            {doctor.licenseNumber && ` • Lic. ${doctor.licenseNumber}`}
          </div>
          {doctor.phone && (
            <div className="header-subtitle">
              Tel: {doctor.phone} • Email: {doctor.email}
            </div>
          )}
        </div>

        {/* Información del Paciente */}
        <div className="section">
          <div className="section-title">{t('print.patientInfo')}</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">{t('print.fullName')}</div>
              <div className="info-value">
                {patient.firstName} {patient.secondName} {patient.lastName} {patient.secondLastName}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">{t('print.record')}</div>
              <div className="info-value">{patient.medicalRecordNumber}</div>
            </div>
            <div className="info-item">
              <div className="info-label">{t('print.ageGender')}</div>
              <div className="info-value">
                {patient.age} {t('patientDetail.years')} • {patient.gender === 'M' ? t('patientDetail.male') : t('patientDetail.female')}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">{t('print.bloodType')}</div>
              <div className="info-value">{patient.bloodType}</div>
            </div>
            <div className="info-item">
              <div className="info-label">{t('print.phone')}</div>
              <div className="info-value">{patient.phone}</div>
            </div>
            <div className="info-item">
              <div className="info-label">{t('print.consultationDate')}</div>
              <div className="info-value">
                {new Date(consultation.consultationDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Motivo de Consulta */}
        <div className="section">
          <div className="section-title">{t('print.reason')}</div>
          <div className="text-block">{consultation.reason}</div>
        </div>

        {/* Signos Vitales (si existen) */}
        {consultation.vitalSigns && Object.values(consultation.vitalSigns).some(v => v) && (
          <div className="section">
            <div className="section-title">{t('print.vitalSigns')}</div>
            <div className="vital-signs-grid">
              {consultation.vitalSigns.bloodPressure && (
                <div className="vital-sign-box">
                  <div className="info-label">{t('print.bloodPressure')}</div>
                  <div className="info-value">{consultation.vitalSigns.bloodPressure}</div>
                </div>
              )}
              {consultation.vitalSigns.temperature && (
                <div className="vital-sign-box">
                  <div className="info-label">{t('print.temperature')}</div>
                  <div className="info-value">{consultation.vitalSigns.temperature}°C</div>
                </div>
              )}
              {consultation.vitalSigns.heartRate && (
                <div className="vital-sign-box">
                  <div className="info-label">{t('print.heartRate')}</div>
                  <div className="info-value">{consultation.vitalSigns.heartRate} {t('print.bpm')}</div>
                </div>
              )}
              {consultation.vitalSigns.respiratoryRate && (
                <div className="vital-sign-box">
                  <div className="info-label">{t('print.respiratoryRate')}</div>
                  <div className="info-value">{consultation.vitalSigns.respiratoryRate} {t('print.rpm')}</div>
                </div>
              )}
            </div>
          </div>
        )}
    
        {/* Notas del Médico */}
        <div className="section">
          <div className="section-title">{t('print.diagnosis')}</div>
          <div className="text-block" style={{ whiteSpace: 'pre-wrap' }}>
            {consultation.doctorNotes}
          </div>
        </div>

        {/* Footer / Firma del Doctor */}
        <div className="footer">
          <div style={{ marginTop: '40px', marginBottom: '10px' }}>
            _______________________________
          </div>
          <div>
            <strong>Dr(a). {doctor.firstName} {doctor.lastName}</strong>
          </div>
          <div>{doctor.specialty}</div>
          {doctor.licenseNumber && <div>Lic. {doctor.licenseNumber}</div>}
          <div style={{ marginTop: '20px', fontSize: '10px' }}>
            {t('print.printDate')}: {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}