"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { patientsApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaPrint, FaFilePdf, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaTooth, FaStethoscope } from 'react-icons/fa';

interface Patient {
  _id: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age?: number;
  gender: 'M' | 'F';
  bloodType: string;
  medicalRecordNumber: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  weight?: number;
  height?: number;
  bmi?: number;
  allergies?: {
    list: { name: string; severity: string }[];
    additionalNotes?: string;
  };
  chronicDiseases?: string[];
  habits?: {
    smoker: boolean;
    alcohol: boolean;
  };
  consultation?: {
    reason?: string;
    symptoms?: string;
    symptomsDuration?: string;
  };
  doctorNotes?: string;
  odontogram?: {
    teeth: {
      number: number;
      status: string;
      notes?: string;
    }[];
    lastUpdate: string;
  };
  createdAt: string;
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

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatient();
  }, [params.id]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getById(params.id as string);
      setPatient(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar paciente');
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
        className="flex flex-col items-center justify-center p-2 rounded-lg border-2"
        style={{ 
          borderColor: color === '#ffffff' ? '#d1d5db' : color,
          backgroundColor: color === '#374151' ? color : `${color}20`
        }}
      >
        <FaTooth 
          className="text-xl mb-1" 
          style={{ color: color === '#ffffff' ? '#6b7280' : color }}
        />
        <span className="text-xs font-semibold text-[rgb(var(--foreground))]">{number}</span>
        {tooth?.notes && (
          <span className="text-[10px] text-[rgb(var(--gray-medium))] mt-1">📝</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--gray-medium))]">Cargando paciente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !patient) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] p-6">
          <div className="text-center">
            <p className="text-[rgb(var(--error))] text-lg mb-4">❌ {error || 'Paciente no encontrado'}</p>
            <Link
              href="/patients"
              className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))]"
            >
              ← Volver a la lista
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[rgb(var(--background))] p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/patients"
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-4"
            >
              <FaArrowLeft />
              <span>Volver a pacientes</span>
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                  {patient.firstName} {patient.secondName} {patient.lastName} {patient.secondLastName}
                </h1>
                <p className="text-[rgb(var(--gray-medium))] mt-1">
                  Expediente: {patient.medicalRecordNumber} • {patient.age} años
                </p>
              </div>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
                  <FaEdit /> Editar
                </button>
                <button className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
                  <FaPrint /> Imprimir
                </button>
                <button className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaUser className="text-[rgb(var(--primary))]" />
                Información Personal
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[rgb(var(--gray-medium))]">Email</p>
                  <p className="text-[rgb(var(--foreground))] flex items-center gap-2">
                    <FaEnvelope className="text-[rgb(var(--primary))]" /> {patient.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--gray-medium))]">Teléfono</p>
                  <p className="text-[rgb(var(--foreground))] flex items-center gap-2">
                    <FaPhone className="text-[rgb(var(--primary))]" /> {patient.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--gray-medium))]">Género</p>
                  <p className="text-[rgb(var(--foreground))]">{patient.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--gray-medium))]">Fecha de Nacimiento</p>
                  <p className="text-[rgb(var(--foreground))]">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[rgb(var(--primary))]" />
                Dirección
              </h2>
              {patient.address && (
                <p className="text-[rgb(var(--foreground))]">
                  {patient.address.street}<br />
                  {patient.address.city}, {patient.address.state}<br />
                  {patient.address.country}
                </p>
              )}
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <FaHeartbeat className="text-[rgb(var(--error))]" />
              Información Médica
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[rgb(var(--gray-medium))]">Tipo de Sangre</p>
                <p className="text-lg font-semibold text-[rgb(var(--foreground))]">{patient.bloodType}</p>
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--gray-medium))]">Peso</p>
                <p className="text-lg font-semibold text-[rgb(var(--foreground))]">{patient.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--gray-medium))]">Altura</p>
                <p className="text-lg font-semibold text-[rgb(var(--foreground))]">{patient.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--gray-medium))]">IMC</p>
                <p className="text-lg font-semibold text-[rgb(var(--foreground))]">{patient.bmi}</p>
              </div>
            </div>
          </div>

          {/* Información de Consulta */}
          {(patient.consultation?.reason || patient.consultation?.symptoms || patient.doctorNotes) && (
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaStethoscope className="text-[rgb(var(--primary))]" />
                Información de Consulta
              </h2>
              
              <div className="space-y-4">
                {patient.consultation?.reason && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Motivo de Consulta:</h3>
                    <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--background))] p-3 rounded-lg border border-[rgb(var(--border))]">
                      {patient.consultation.reason}
                    </p>
                  </div>
                )}

                {patient.consultation?.symptoms && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Síntomas:</h3>
                    <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--background))] p-3 rounded-lg border border-[rgb(var(--border))]">
                      {patient.consultation.symptoms}
                    </p>
                  </div>
                )}

                {patient.consultation?.symptomsDuration && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Duración de Síntomas:</h3>
                    <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--background))] p-3 rounded-lg border border-[rgb(var(--border))]">
                      {patient.consultation.symptomsDuration}
                    </p>
                  </div>
                )}

                {patient.doctorNotes && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">📋 Notas del Médico:</h3>
                    <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--warning)/0.1)] p-4 rounded-lg border-2 border-[rgb(var(--warning))]">
                      {patient.doctorNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Odontograma */}
          {patient.odontogram && patient.odontogram.teeth && patient.odontogram.teeth.length > 0 && (
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaTooth className="text-[rgb(var(--primary))]" />
                Odontograma
              </h2>

              {/* Leyenda */}
              <div className="bg-[rgb(var(--background))] rounded-lg p-4 border border-[rgb(var(--border))] mb-6">
                <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Leyenda:</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(TOOTH_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ 
                          backgroundColor: TOOTH_COLORS[key],
                          borderColor: key === 'sano' ? '#d1d5db' : TOOTH_COLORS[key]
                        }}
                      />
                      <span className="text-xs text-[rgb(var(--foreground))]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dientes */}
              <div className="space-y-8">
                <div>
                  <p className="text-center text-sm font-semibold text-[rgb(var(--gray-medium))] mb-3">MAXILAR SUPERIOR</p>
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    {[18, 17, 16, 15, 14, 13, 12, 11].map(renderTooth)}
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {[21, 22, 23, 24, 25, 26, 27, 28].map(renderTooth)}
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-[rgb(var(--border))]"></div>

                <div>
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    {[48, 47, 46, 45, 44, 43, 42, 41].map(renderTooth)}
                  </div>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {[31, 32, 33, 34, 35, 36, 37, 38].map(renderTooth)}
                  </div>
                  <p className="text-center text-sm font-semibold text-[rgb(var(--gray-medium))]">MAXILAR INFERIOR</p>
                </div>
              </div>

              {/* Resumen de dientes modificados */}
              <div className="mt-6 bg-[rgb(var(--background))] rounded-lg p-4 border border-[rgb(var(--border))]">
                <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Diagnóstico Dental:</h3>
                <div className="space-y-2">
                  {patient.odontogram.teeth
                    .filter(t => t.status !== 'sano')
                    .map(t => (
                      <div key={t.number} className="flex items-start gap-3">
                        <span className="font-semibold text-[rgb(var(--foreground))]">Diente {t.number}:</span>
                        <div>
                          <span className="text-[rgb(var(--foreground))]">{TOOTH_LABELS[t.status]}</span>
                          {t.notes && <p className="text-sm text-[rgb(var(--gray-medium))] mt-1">{t.notes}</p>}
                        </div>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-4">
                  Última actualización: {new Date(patient.odontogram.lastUpdate).toLocaleString()}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}