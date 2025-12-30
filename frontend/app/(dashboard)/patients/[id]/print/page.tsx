"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { patientsApi, authApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaTooth } from 'react-icons/fa';

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
  weight?: number;
  height?: number;
  bmi?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  allergies?: {
    list: { name: string; severity: string }[];
    additionalNotes?: string;
  };
  odontogram?: {
    teeth: {
      number: number;
      status: string;
      notes?: string;
    }[];
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

const TOOTH_COLORS: Record<string, string> = {
  sano: '#ffffff',
  caries: '#ef4444',
  obturacion: '#3b82f6',
  ausente: '#374151',
  fractura: '#f59e0b',
  corona: '#8b5cf6',
  implante: '#10b981',
  endodoncia: '#ec4899',
  porExtraer: '#f97316'
};

const TOOTH_LABELS: Record<string, string> = {
  sano: 'Sano',
  caries: 'Caries',
  obturacion: 'Obturación',
  ausente: 'Ausente',
  fractura: 'Fractura',
  corona: 'Corona',
  implante: 'Implante',
  endodoncia: 'Endodoncia',
  porExtraer: 'Por Extraer'
};

export default function PrintPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isOdontologist, setIsOdontologist] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-print cuando todo esté cargado
    if (!loading && patient && doctor) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, patient, doctor]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar doctor actual
      const doctorData = await authApi.getCurrentUser();
      setDoctor(doctorData);
      setIsOdontologist(doctorData.specialty?.toLowerCase().includes('odonto'));

      // Cargar paciente
      const patientResponse = await patientsApi.getById(params.id as string);
      setPatient(patientResponse.data);

    } catch (err: any) {
      setError(err.message || 'Error al cargar información');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTooth = (number: number) => {
    const tooth = patient?.odontogram?.teeth.find(t => t.number === number);
    const status = tooth?.status || 'sano';
    const color = TOOTH_COLORS[status];

    return (
      <div
        key={number}
        className="tooth-item"
        style={{
          borderColor: color === '#ffffff' ? '#d1d5db' : color,
          backgroundColor: color === '#374151' ? color : `${color}20`
        }}
      >
        <FaTooth
          className="tooth-icon"
          style={{ color: color === '#ffffff' ? '#6b7280' : color }}
        />
        <span className="tooth-number">{number}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Preparando historia clínica...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !patient || !doctor) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">❌ {error || 'No se pudo cargar la información'}</p>
            <button
              onClick={() => window.close()}
              className="text-blue-600 hover:underline"
            >
              ← Cerrar
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

            .page-break {
              page-break-before: always;
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

          .allergy-item {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 8px;
          }

          .severity-high {
            background: #fee2e2;
            border-color: #ef4444;
          }

          .severity-medium {
            background: #fef3c7;
            border-color: #f59e0b;
          }

          .severity-low {
            background: #dbeafe;
            border-color: #3b82f6;
          }

          .odontogram-grid {
            margin: 15px 0;
          }

          .teeth-row {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 4px;
            margin-bottom: 8px;
          }

          .tooth-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border: 2px solid;
            border-radius: 6px;
            min-height: 60px;
          }

          .tooth-icon {
            font-size: 18px;
            margin-bottom: 3px;
          }

          .tooth-number {
            font-size: 11px;
            font-weight: bold;
          }

          .legend {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-top: 15px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
          }

          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
            border: 1px solid #d1d5db;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }

          .no-print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1000;
          }

          .no-print-button:hover {
            background: #1d4ed8;
          }
        `}</style>

        {/* Botón Volver (solo visible en pantalla) */}
        <button
          onClick={() => window.close()}
          className="no-print no-print-button"
        >
          ← Volver
        </button>

        {/* Header / Membrete */}
        <div className="header">
          <div className="header-title">HISTORIA CLÍNICA</div>
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
          <div className="section-title">Información Personal</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Nombre Completo</div>
              <div className="info-value">
                {patient.firstName} {patient.secondName} {patient.lastName} {patient.secondLastName}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Expediente</div>
              <div className="info-value">{patient.medicalRecordNumber}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Edad / Género</div>
              <div className="info-value">
                {patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Fecha de Nacimiento</div>
              <div className="info-value">
                {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Teléfono</div>
              <div className="info-value">{patient.phone}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{patient.email}</div>
            </div>
          </div>

          {patient.address && (
            <>
              <div className="info-label" style={{ marginTop: '15px', marginBottom: '5px' }}>Dirección</div>
              <div className="info-value">
                {patient.address.street}, {patient.address.city}, {patient.address.state}, {patient.address.country}
              </div>
            </>
          )}
        </div>

        {/* Información Médica */}
        <div className="section">
          <div className="section-title">Información Médica</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Tipo de Sangre</div>
              <div className="info-value">{patient.bloodType}</div>
            </div>
            {patient.weight && (
              <div className="info-item">
                <div className="info-label">Peso</div>
                <div className="info-value">{patient.weight} kg</div>
              </div>
            )}
            {patient.height && (
              <div className="info-item">
                <div className="info-label">Altura</div>
                <div className="info-value">{patient.height} cm</div>
              </div>
            )}
            {patient.bmi && (
              <div className="info-item">
                <div className="info-label">IMC</div>
                <div className="info-value">{patient.bmi}</div>
              </div>
            )}
          </div>
        </div>

       {/* Alergias */}
        <div className="section">
          <div className="section-title">Alergias</div>
          
          {patient.allergies && patient.allergies.list && patient.allergies.list.length > 0 ? (
            <>
              {patient.allergies.list.map((allergy, index) => (
                <div 
                  key={index} 
                  className={`allergy-item ${
                    allergy.severity === 'Alta' ? 'severity-high' : 
                    allergy.severity === 'Media' ? 'severity-medium' : 
                    'severity-low'
                  }`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{allergy.name}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: allergy.severity === 'Alta' ? '#dc2626' : 
                                      allergy.severity === 'Media' ? '#f59e0b' : '#3b82f6',
                      color: 'white'
                    }}>
                      {allergy.severity}
                    </span>
                  </div>
                </div>
              ))}
              {patient.allergies.additionalNotes && (
                <div className="text-block" style={{ marginTop: '10px' }}>
                  <div className="info-label">Notas Adicionales</div>
                  <div style={{ marginTop: '5px' }}>{patient.allergies.additionalNotes}</div>
                </div>
              )}
            </>
          ) : (
            <div className="text-block">
              <span style={{ color: '#64748b', fontStyle: 'italic' }}>Sin alergias registradas</span>
            </div>
          )}
        </div>

        {/* Odontograma (solo para odontólogos) */}
        {isOdontologist && patient.odontogram && patient.odontogram.teeth && patient.odontogram.teeth.length > 0 && (
          <div className="section page-break">
            <div className="section-title">Odontograma</div>
            <div className="odontogram-grid">
              <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
                MAXILAR SUPERIOR
              </p>
              <div className="teeth-row">
                {[18, 17, 16, 15, 14, 13, 12, 11].map(renderTooth)}
              </div>
              <div className="teeth-row">
                {[21, 22, 23, 24, 25, 26, 27, 28].map(renderTooth)}
              </div>

              <div style={{ borderTop: '2px dashed #d1d5db', margin: '15px 0' }}></div>

              <div className="teeth-row">
                {[48, 47, 46, 45, 44, 43, 42, 41].map(renderTooth)}
              </div>
              <div className="teeth-row">
                {[31, 32, 33, 34, 35, 36, 37, 38].map(renderTooth)}
              </div>
              <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', marginTop: '10px' }}>
                MAXILAR INFERIOR
              </p>

              {/* Leyenda */}
              <div className="legend">
                {Object.entries(TOOTH_LABELS).map(([key, label]) => (
                  <div key={key} className="legend-item">
                    <div
                      className="legend-color"
                      style={{
                        backgroundColor: TOOTH_COLORS[key],
                        borderColor: key === 'sano' ? '#d1d5db' : TOOTH_COLORS[key]
                      }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
            Fecha de impresión: {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}