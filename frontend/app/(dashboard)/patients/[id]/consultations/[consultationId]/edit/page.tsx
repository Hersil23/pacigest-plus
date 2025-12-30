"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { consultationsApi, patientsApi } from '@/lib/api';
import { FaArrowLeft, FaSave, FaStethoscope, FaHeartbeat, FaNotesMedical } from 'react-icons/fa';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ConsultationFormData {
  consultationDate: string;
  reason: string;
  vitalSigns: {
    bloodPressure: string;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
  };
  doctorNotes: string;
}

export default function EditConsultationPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  
  const [formData, setFormData] = useState<ConsultationFormData>({
    consultationDate: '',
    reason: '',
    vitalSigns: {
      bloodPressure: '',
      temperature: 0,
      heartRate: 0,
      respiratoryRate: 0
    },
    doctorNotes: ''
  });

  useEffect(() => {
    loadData();
  }, [params.id, params.consultationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del paciente
      const patientResponse = await patientsApi.getById(params.id as string);
      setPatientName(`${patientResponse.data.firstName} ${patientResponse.data.lastName}`);

      // Cargar consulta existente
      const consultationResponse = await consultationsApi.getById(
        params.id as string,
        params.consultationId as string
      );
      
      const consultation = consultationResponse.data;
      
      setFormData({
        consultationDate: consultation.consultationDate?.split('T')[0] || '',
        reason: consultation.reason || '',
        vitalSigns: {
          bloodPressure: consultation.vitalSigns?.bloodPressure || '',
          temperature: consultation.vitalSigns?.temperature || 0,
          heartRate: consultation.vitalSigns?.heartRate || 0,
          respiratoryRate: consultation.vitalSigns?.respiratoryRate || 0
        },
        doctorNotes: consultation.doctorNotes || ''
      });
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        let newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
        current[keys[keys.length - 1]] = finalValue;
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSaving(true);

    try {
      await consultationsApi.update(
        params.id as string,
        params.consultationId as string,
        formData
      );
      
      router.push(`/patients/${params.id}`);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar consulta');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--gray-medium))]">Cargando consulta...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[rgb(var(--background))] p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/patients/${params.id}`}
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-4"
            >
              <FaArrowLeft />
              <span>Volver al detalle del paciente</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              ✏️ Editar Consulta
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-1">
              Paciente: {patientName}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error))] text-[rgb(var(--error))] px-4 py-3 rounded-lg mb-6">
              ❌ {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FECHA DE CONSULTA (Solo lectura) */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                📅 Fecha de la Consulta
              </h2>
              
              <div className="bg-[rgb(var(--background))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <p className="text-[rgb(var(--foreground))] font-medium">
                  {new Date(formData.consultationDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                  La fecha de la consulta no puede modificarse
                </p>
              </div>
            </div>

            {/* MOTIVO DE CONSULTA */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaStethoscope className="text-[rgb(var(--primary))]" />
                Motivo de Consulta
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  ¿Cuál es el motivo de su consulta hoy? Describa los síntomas que presenta y desde cuándo <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={6}
                  minLength={50}
                  placeholder="Ejemplo: Dolor abdominal intenso desde hace 2 días, acompañado de náuseas y fiebre..."
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))] resize-none"
                />
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                  Mínimo 50 caracteres - Incluya motivo, síntomas y duración
                </p>
              </div>
            </div>

            {/* SIGNOS VITALES */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-[rgb(var(--error))]" />
                Signos Vitales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Presión Arterial <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="vitalSigns.bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleChange}
                    required
                    placeholder="120/80"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Temperatura (°C) <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vitalSigns.temperature"
                    value={formData.vitalSigns.temperature || ''}
                    onChange={handleChange}
                    required
                    placeholder="36.5"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Frecuencia Cardíaca (lpm) <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    name="vitalSigns.heartRate"
                    value={formData.vitalSigns.heartRate || ''}
                    onChange={handleChange}
                    required
                    placeholder="70"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Frecuencia Respiratoria (rpm) <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    name="vitalSigns.respiratoryRate"
                    value={formData.vitalSigns.respiratoryRate || ''}
                    onChange={handleChange}
                    required
                    placeholder="16"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* NOTAS DEL MÉDICO */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaNotesMedical className="text-[rgb(var(--success))]" />
                Diagnóstico y Plan del Médico
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Impresiones, diagnóstico, plan de tratamiento <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <textarea
                  name="doctorNotes"
                  value={formData.doctorNotes}
                  onChange={handleChange}
                  required
                  rows={8}
                  minLength={50}
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="Escriba aquí sus observaciones médicas, diagnóstico y plan..."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-[rgb(var(--background))] p-4 border-t border-[rgb(var(--border))]">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>💾 Guardar Cambios</span>
                  </>
                )}
              </button>

              <Link
                href={`/patients/${params.id}`}
                className="px-6 py-3 bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] transition-colors font-medium text-center"
              >
                ❌ Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}