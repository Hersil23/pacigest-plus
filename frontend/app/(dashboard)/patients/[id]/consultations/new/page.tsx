"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { patientsApi, consultationsApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaStethoscope } from 'react-icons/fa';

interface ConsultationFormData {
  consultationDate: string;
  reason: string;
  symptoms: string;
  symptomsDuration: string;
  doctorNotes: string;
  vitalSigns: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    respiratoryRate: string;
  };
}

export default function NewConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [formData, setFormData] = useState<ConsultationFormData>({
    consultationDate: new Date().toISOString().split('T')[0],
    reason: '',
    symptoms: '',
    symptomsDuration: '',
    doctorNotes: '',
    vitalSigns: {
      bloodPressure: '',
      temperature: '',
      heartRate: '',
      respiratoryRate: ''
    }
  });

  useEffect(() => {
    loadPatientInfo();
  }, [params.id]);

  const loadPatientInfo = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getById(params.id as string);
      setPatientName(`${response.data.firstName} ${response.data.lastName}`);
    } catch (err: any) {
      setError(err.message || 'Error al cargar información del paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('vitalSigns.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (formData.reason.length < 20) {
      setError('El motivo de consulta debe tener al menos 20 caracteres');
      return;
    }

    if (formData.symptoms.length < 30) {
      setError('Los síntomas deben tener al menos 30 caracteres');
      return;
    }

    if (formData.doctorNotes.length < 50) {
      setError('Las notas del médico deben tener al menos 50 caracteres');
      return;
    }

    setSaving(true);

    try {
      // Preparar datos - solo incluir signos vitales si tienen valor
      const dataToSend: any = {
        consultationDate: formData.consultationDate,
        reason: formData.reason,
        symptoms: formData.symptoms,
        symptomsDuration: formData.symptomsDuration,
        doctorNotes: formData.doctorNotes
      };

      // Solo agregar vitalSigns si al menos uno tiene valor
      const hasVitalSigns = Object.values(formData.vitalSigns).some(v => v !== '');
      if (hasVitalSigns) {
        dataToSend.vitalSigns = {
          bloodPressure: formData.vitalSigns.bloodPressure || undefined,
          temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
          heartRate: formData.vitalSigns.heartRate ? parseInt(formData.vitalSigns.heartRate) : undefined,
          respiratoryRate: formData.vitalSigns.respiratoryRate ? parseInt(formData.vitalSigns.respiratoryRate) : undefined
        };
      }

      await consultationsApi.create(params.id as string, dataToSend);
      router.push(`/patients/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear consulta');
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
            <p className="text-[rgb(var(--gray-medium))]">Cargando...</p>
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
              <span>Volver al paciente</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
              <FaStethoscope className="text-[rgb(var(--primary))]" />
              Nueva Consulta
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-1">
              Paciente: <span className="font-semibold">{patientName}</span>
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
            
            {/* Fecha de Consulta */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                Fecha de la Consulta
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Fecha <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                  Por defecto es la fecha de hoy
                </p>
              </div>
            </div>

            {/* Información de Consulta */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                Información de la Consulta
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Motivo de Consulta <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Describa el motivo de la consulta (mínimo 20 caracteres)"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))] resize-none"
                  />
                  <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                    {formData.reason.length}/20 caracteres mínimo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Síntomas <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describa los síntomas en detalle (mínimo 30 caracteres)"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))] resize-none"
                  />
                  <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                    {formData.symptoms.length}/30 caracteres mínimo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Duración de los Síntomas <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="symptomsDuration"
                    value={formData.symptomsDuration}
                    onChange={handleChange}
                    required
                    placeholder='Ej: "Hace 3 días", "1 semana", "2 meses"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* Signos Vitales (Opcional) */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
                Signos Vitales
              </h2>
              <p className="text-sm text-[rgb(var(--gray-medium))] mb-4">
                Opcional - Complete solo los signos vitales que tomó
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Presión Arterial
                  </label>
                  <input
                    type="text"
                    name="vitalSigns.bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleChange}
                    placeholder="Ej: 120/80"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vitalSigns.temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={handleChange}
                    placeholder="Ej: 36.5"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Frecuencia Cardíaca (bpm)
                  </label>
                  <input
                    type="number"
                    name="vitalSigns.heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleChange}
                    placeholder="Ej: 72"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Frecuencia Respiratoria (rpm)
                  </label>
                  <input
                    type="number"
                    name="vitalSigns.respiratoryRate"
                    value={formData.vitalSigns.respiratoryRate}
                    onChange={handleChange}
                    placeholder="Ej: 16"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* Notas del Médico */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                Notas del Médico
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Diagnóstico y Plan de Tratamiento <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <textarea
                  name="doctorNotes"
                  value={formData.doctorNotes}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Escriba su diagnóstico, plan de tratamiento, recetas, indicaciones, etc. (mínimo 50 caracteres)"
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))] resize-none"
                />
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                  {formData.doctorNotes.length}/50 caracteres mínimo
                </p>
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
                    <span>💾 Guardar Consulta</span>
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