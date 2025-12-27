"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientsApi } from '@/lib/api';
import { PatientFormData } from '@/types/patient';
import { FaArrowLeft, FaSave, FaUser, FaHeartbeat, FaStethoscope, FaFileMedical, FaNotesMedical } from 'react-icons/fa';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NewPatientPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Estado del formulario
  const [formData, setFormData] = useState<PatientFormData>({
    // Datos de consulta (auto)
    consultationDate: new Date().toISOString().split('T')[0],
    consultationTime: new Date().toTimeString().slice(0, 5),
    
    // Identificación
    documentType: 'cedula',
    documentNumber: '',
    documentCountry: 'Venezuela',
    
    // Datos personales
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    dateOfBirth: '',
    gender: 'M',
    email: '',
    phone: '',
    secondaryPhone: '',
    
    // Dirección
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Venezuela'
    },
    
    // Seguro
    insurance: {
      hasInsurance: false,
      provider: '',
      policyNumber: '',
      planType: '',
      validUntil: ''
    },
    
    // Contacto de emergencia
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    
    // Datos médicos críticos
    bloodType: 'O+',
    allergies: {
      medications: '',
      food: '',
      others: ''
    },
    
    // Signos vitales
    vitalSigns: {
      bloodPressure: '',
      temperature: 0,
      heartRate: 0,
      respiratoryRate: 0,
      weight: 0,
      height: 0
    },
    
    // Motivo de consulta
    consultation: {
      reason: '',
      symptoms: '',
      symptomsDuration: '',
      previousTreatment: false,
      treatmentDetails: '',
      recentConsultations: false,
      consultationDetails: ''
    },
    
    // Historial médico
    medicalHistory: {
      chronicDiseases: '',
      currentMedications: '',
      hospitalizations: false,
      hospitalizationDetails: '',
      surgeries: false,
      surgeryDetails: '',
      bloodTransfusions: false,
      transfusionDate: '',
      vaccination: {
        covid19: false,
        covid19Doses: 0,
        influenza: false,
        influenzaDate: '',
        others: ''
      },
      familyHistory: '',
      lifestyle: {
        smoking: false,
        smokingQuantity: 0,
        smokingDuration: '',
        alcohol: false,
        alcoholFrequency: '',
        physicalActivity: 'sedentario',
        diet: '',
        dietObservations: ''
      }
    },
    
    // Referencia
    referral: {
      wasReferred: false,
      referringDoctor: '',
      specialty: '',
      reason: ''
    },
    
    // Notas del médico
    doctorNotes: '',
    
    // Archivos
    files: {},
    
    // Consentimiento
    consent: {
      accepted: false,
      signature: '',
      signedBy: '',
      signedAt: ''
    },
    
    // Metadatos
    createdBy: '',
    status: 'active'
  });

  // Calcular edad automáticamente
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      // Guardamos edad para mostrar, pero no la enviamos al backend
      setCalculatedAge(age);
    }
  }, [formData.dateOfBirth]);

  const [calculatedAge, setCalculatedAge] = useState(0);
  const [showRepresentative, setShowRepresentative] = useState(false);

  // Mostrar/ocultar representante legal si es menor de edad
  useEffect(() => {
    setShowRepresentative(calculatedAge < 18 && calculatedAge > 0);
  }, [calculatedAge]);

  // Calcular IMC automáticamente
  useEffect(() => {
    const { weight, height } = formData.vitalSigns;
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setCalculatedBMI(bmi.toFixed(1));
    }
  }, [formData.vitalSigns.weight, formData.vitalSigns.height]);

  const [calculatedBMI, setCalculatedBMI] = useState('0');

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Manejar checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name.includes('.')) {
        const keys = name.split('.');
        setFormData(prev => {
          let newData = { ...prev };
          let current: any = newData;
          
          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = checked;
          return newData;
        });
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
      return;
    }
    
    // Manejar inputs anidados
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        let newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        // Convertir a número si es necesario
        const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
        current[keys[keys.length - 1]] = finalValue;
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await patientsApi.create(formData);
      // Redirigir a página de éxito con datos del paciente
      router.push(`/patients/${response.data._id}/success`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear historia clínica');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[rgb(var(--background))] p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/patients"
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-4"
            >
              <FaArrowLeft />
              <span>Volver a pacientes</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              📋 Nueva Historia Clínica
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-1">
              Complete toda la información del paciente
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 mb-6 border border-[rgb(var(--border))]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[rgb(var(--foreground))]">Progreso del formulario</span>
              <span className="text-sm font-bold text-[rgb(var(--primary))]">{progress}%</span>
            </div>
            <div className="w-full bg-[rgb(var(--background))] rounded-full h-2">
              <div 
                className="bg-[rgb(var(--primary))] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error))] text-[rgb(var(--error))] px-4 py-3 rounded-lg mb-6">
              ❌ {error}
            </div>
          )}
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ============================================ */}
            {/* SECCIÓN 1: INFORMACIÓN BÁSICA DEL PACIENTE */}
            {/* ============================================ */}
            
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaUser className="text-[rgb(var(--primary))]" />
                1. Información Básica del Paciente
              </h2>
              
              {/* Datos de consulta (Auto) */}
              <div className="bg-[rgb(var(--background))] rounded-lg p-4 mb-4">
                <p className="text-sm text-[rgb(var(--gray-medium))] mb-2">Datos de la Consulta:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm">📅 Fecha: </span>
                    <span className="font-medium">{formData.consultationDate}</span>
                  </div>
                  <div>
                    <span className="text-sm">🕐 Hora: </span>
                    <span className="font-medium">{formData.consultationTime}</span>
                  </div>
                </div>
              </div>

              {/* Identificación */}
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3 mt-6">Identificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Tipo de Documento <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  >
                    <option value="cedula">Cédula</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="partida">Partida de Nacimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Número de Documento <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    País de Emisión <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="documentCountry"
                    value={formData.documentCountry}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>

              {/* Datos Personales */}
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3 mt-6">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Primer Nombre <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Segundo Nombre
                  </label>
                  <input
                    type="text"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Primer Apellido <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    name="secondLastName"
                    value={formData.secondLastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Fecha de Nacimiento <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                  {calculatedAge > 0 && (
                    <p className="text-sm text-[rgb(var(--primary))] mt-1">
                      Edad: {calculatedAge} años
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Género <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Email <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Teléfono Principal <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>

              {/* Tipo de Sangre y Alergias */}
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3 mt-6">Datos Médicos Críticos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Tipo de Sangre <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Alergias a Medicamentos <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="allergies.medications"
                    value={formData.allergies.medications}
                    onChange={handleChange}
                    required
                    placeholder='Si ninguna, escribir "Ninguna"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* SECCIÓN 1.5: SIGNOS VITALES */}
            {/* ============================================ */}
            
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-[rgb(var(--error))]" />
                1.5. Signos Vitales (Consulta Actual)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="18"
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Peso (kg) <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vitalSigns.weight"
                    value={formData.vitalSigns.weight || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Altura (cm) <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vitalSigns.height"
                    value={formData.vitalSigns.height || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                  {calculatedBMI !== '0' && (
                    <p className="text-sm text-[rgb(var(--primary))] mt-1">
                      IMC: {calculatedBMI}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* SECCIÓN 2: MOTIVO DE CONSULTA */}
            {/* ============================================ */}
            
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaStethoscope className="text-[rgb(var(--primary))]" />
                2. Motivo de Consulta
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    ¿Cuál es el motivo de su consulta hoy? <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="consultation.reason"
                    value={formData.consultation.reason}
                    onChange={handleChange}
                    required
                    rows={3}
                    minLength={20}
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Describa los síntomas que presenta <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="consultation.symptoms"
                    value={formData.consultation.symptoms}
                    onChange={handleChange}
                    required
                    rows={4}
                    minLength={30}
                    placeholder="Dolor, sangrado, fiebre, dificultad para respirar, etc."
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    ¿Desde cuándo presenta estos síntomas? <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="consultation.symptomsDuration"
                    value={formData.consultation.symptomsDuration}
                    onChange={handleChange}
                    required
                    placeholder='Ejemplo: "Hace 3 días" o "Hace 2 semanas"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consultation.previousTreatment"
                      checked={formData.consultation.previousTreatment}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                      ¿Ha recibido tratamiento para este problema?
                    </span>
                  </label>
                  
                  {formData.consultation.previousTreatment && (
                    <textarea
                      name="consultation.treatmentDetails"
                      value={formData.consultation.treatmentDetails}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Describa el tratamiento recibido"
                      className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))] mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
{/* ============================================ */}
            {/* SECCIÓN 6: NOTAS DEL MÉDICO */}
            {/* ============================================ */}
            
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaNotesMedical className="text-[rgb(var(--success))]" />
                6. Observaciones del Médico
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Espacio para destacar aspectos importantes de la consulta <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <p className="text-xs text-[rgb(var(--gray-medium))] mb-2">
                  Incluya: impresiones diagnósticas, hallazgos relevantes, plan de tratamiento, 
                  exámenes solicitados, medicamentos prescritos, recomendaciones, próxima cita, etc.
                </p>
                <textarea
                  name="doctorNotes"
                  value={formData.doctorNotes}
                  onChange={handleChange}
                  required
                  rows={8}
                  minLength={50}
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  placeholder="Escriba aquí sus observaciones médicas..."
                />
                <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
                  Mínimo 50 caracteres
                </p>
              </div>
            </div>

            {/* ============================================ */}
            {/* SECCIÓN 7: CONSENTIMIENTO */}
            {/* ============================================ */}
            
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                📋 7. Consentimiento Informado
              </h2>
              
              <div className="bg-[rgb(var(--background))] rounded-lg p-4 mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent.accepted"
                    checked={formData.consent.accepted}
                    onChange={handleChange}
                    required
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-sm text-[rgb(var(--foreground))]">
                    Acepto que la información proporcionada es verídica y autorizo el uso de mis datos 
                    para fines médicos conforme a las leyes de protección de datos vigentes. 
                    <span className="text-[rgb(var(--error))]"> *</span>
                  </span>
                </label>
              </div>

              {formData.consent.accepted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Nombre completo (firma) <span className="text-[rgb(var(--error))]">*</span>
                    </label>
                    <input
                      type="text"
                      name="consent.signedBy"
                      value={formData.consent.signedBy}
                      onChange={handleChange}
                      required
                      placeholder="Nombre del paciente o representante"
                      className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Fecha
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString()}
                      disabled
                      className="w-full px-4 py-2 bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--gray-medium))]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-[rgb(var(--background))] p-4 -mx-6 border-t border-[rgb(var(--border))]">
              <button
                type="submit"
                disabled={loading || !formData.consent.accepted}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando Historia Clínica...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>💾 Guardar Historia Clínica</span>
                  </>
                )}
              </button>

              <Link
                href="/patients"
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