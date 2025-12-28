"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { patientsApi } from '@/lib/api';
import { PatientFormData, ClinicalPhoto } from '@/types/patient';
import { FaArrowLeft, FaSave, FaUser, FaHeartbeat, FaStethoscope, FaFileMedical, FaNotesMedical, FaCamera, FaSignature, FaTrash, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Odontogram from '@/components/Odontogram';

// Avatar por defecto
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e0e0e0' width='200' height='200'/%3E%3Cpath fill='%23999' d='M100 100c13.807 0 25-11.193 25-25S113.807 50 100 50s-25 11.193-25 25 11.193 25 25 25zm0 12.5c-16.667 0-50 8.363-50 25v12.5h100v-12.5c0-16.637-33.333-25-50-25z'/%3E%3C/svg%3E";

export default function NewPatientPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOdontologist = (user?.specialty || '').toLowerCase().includes('odont');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const patientPhotoInputRef = useRef<HTMLInputElement>(null);
  const clinicalPhotoInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<PatientFormData>({
    consultationDate: new Date().toISOString().split('T')[0],
    consultationTime: new Date().toTimeString().slice(0, 5),
    documentType: 'cedula',
    documentNumber: '',
    documentCountry: 'Venezuela',
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    dateOfBirth: '',
    gender: 'M',
    email: '',
    phone: '',
    secondaryPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Venezuela'
    },
    insurance: {
      hasInsurance: false,
      provider: '',
      policyNumber: '',
      planType: '',
      validUntil: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    bloodType: 'O+',
    allergies: {
      medications: '',
      food: '',
      others: ''
    },
    vitalSigns: {
      bloodPressure: '',
      temperature: 0,
      heartRate: 0,
      respiratoryRate: 0,
      weight: 0,
      height: 0
    },
    consultation: {
      reason: '',
      symptoms: '',
      symptomsDuration: '',
      previousTreatment: false,
      treatmentDetails: '',
      recentConsultations: false,
      consultationDetails: ''
    },
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
    referral: {
      wasReferred: false,
      referringDoctor: '',
      specialty: '',
      reason: ''
    },
    doctorNotes: '',
    odontogram: {
      teeth: [],
      lastUpdate: new Date()
    },
    files: {
      patientPhoto: '',
      clinicalPhotos: []
    },
    consent: {
      accepted: false,
      signature: '',
      signedBy: '',
      signedAt: ''
    },
    createdBy: user?._id || '',
    status: 'active'
  });

  const [calculatedAge, setCalculatedAge] = useState(0);
  const [calculatedBMI, setCalculatedBMI] = useState('0');
  const [showRepresentative, setShowRepresentative] = useState(false);
  const [patientPhotoPreview, setPatientPhotoPreview] = useState<string>(DEFAULT_AVATAR);
  const [clinicalPhotos, setClinicalPhotos] = useState<ClinicalPhoto[]>([]);
  const [currentPhotoDescription, setCurrentPhotoDescription] = useState('');

  // Calcular edad
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCalculatedAge(age);
      setShowRepresentative(age < 18 && age > 0);
    }
  }, [formData.dateOfBirth]);

  // Calcular IMC
  useEffect(() => {
    const { weight, height } = formData.vitalSigns;
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setCalculatedBMI(bmi.toFixed(1));
    }
  }, [formData.vitalSigns.weight, formData.vitalSigns.height]);

  // Manejar cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
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

  // Upload foto del paciente
  const handlePatientPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La foto no debe superar 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPatientPhotoPreview(base64);
        setFormData(prev => ({
          ...prev,
          files: {
            ...prev.files,
            patientPhoto: base64
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload fotos clínicas
  const handleClinicalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (clinicalPhotos.length >= 20) {
        alert('Máximo 20 fotos clínicas permitidas');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('La foto no debe superar 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ClinicalPhoto = {
          url: reader.result as string,
          description: currentPhotoDescription || 'Sin descripción',
          uploadedAt: new Date().toISOString()
        };
        
        const updatedPhotos = [...clinicalPhotos, newPhoto];
        setClinicalPhotos(updatedPhotos);
        setFormData(prev => ({
          ...prev,
          files: {
            ...prev.files,
            clinicalPhotos: updatedPhotos
          }
        }));
        setCurrentPhotoDescription('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar foto clínica
  const removeClinicalPhoto = (index: number) => {
    const updatedPhotos = clinicalPhotos.filter((_, i) => i !== index);
    setClinicalPhotos(updatedPhotos);
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        clinicalPhotos: updatedPhotos
      }
    }));
  };

  // Canvas firma - iniciar dibujo
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  // Canvas firma - dibujar
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Canvas firma - terminar dibujo
  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = signatureCanvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        setFormData(prev => ({
          ...prev,
          consent: {
            ...prev.consent,
            signature: signatureData,
            signedAt: new Date().toISOString()
          }
        }));
      }
      setIsDrawing(false);
    }
  };

  // Limpiar firma
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData(prev => ({
          ...prev,
          consent: {
            ...prev.consent,
            signature: '',
            signedAt: ''
          }
        }));
      }
    }
  };

  // Enviar formulario
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent.signature) {
      alert('La firma digital es obligatoria');
      window.scrollTo(0, document.body.scrollHeight);
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      // Transformar payload: extraer weight y height de vitalSigns
      const payload = {
        ...formData,
        weight: formData.vitalSigns.weight,
        height: formData.vitalSigns.height,
        vitalSigns: undefined // Eliminar vitalSigns del payload
      };

      const response = await patientsApi.create(payload);
      router.push('/patients');
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
              📋 Nueva Historia Clínica Completa
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-1">
              Complete toda la información del paciente
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
            
            {/* FOTO DEL PACIENTE */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaCamera className="text-[rgb(var(--primary))]" />
                Foto del Paciente (Opcional)
              </h2>
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img 
                    src={patientPhotoPreview} 
                    alt="Paciente" 
                    className="w-40 h-40 object-cover rounded-lg border-2 border-[rgb(var(--primary))]"
                  />
                  {patientPhotoPreview !== DEFAULT_AVATAR && (
                    <button
                      type="button"
                      onClick={() => {
                        setPatientPhotoPreview(DEFAULT_AVATAR);
                        setFormData(prev => ({ ...prev, files: { ...prev.files, patientPhoto: '' }}));
                      }}
                      className="absolute -top-2 -right-2 bg-[rgb(var(--error))] text-white rounded-full p-2 hover:bg-[rgb(var(--error))/0.8]"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                <input
                  ref={patientPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePatientPhotoUpload}
                  className="hidden"
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.setAttribute('capture', 'user');
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('La foto no debe superar 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setPatientPhotoPreview(base64);
                            setFormData(prev => ({
                              ...prev,
                              files: { ...prev.files, patientPhoto: base64 }
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2 bg-[rgb(var(--success))] text-white rounded-lg hover:bg-[rgb(var(--success))/0.8] flex items-center gap-2"
                  >
                    <FaCamera /> Tomar Foto
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => patientPhotoInputRef.current?.click()}
                    className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] flex items-center gap-2"
                  >
                    <FaCamera /> Subir Foto
                  </button>
                </div>
                <p className="text-xs text-[rgb(var(--gray-medium))]">Máximo 5MB - JPG, PNG</p>
              </div>
            </div>

            {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaUser className="text-[rgb(var(--primary))]" />
                Información Básica del Paciente
              </h2>
              
              {/* Datos de consulta */}
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

              {/* Dirección */}
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3 mt-6">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Calle/Avenida <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Ciudad <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Estado/Provincia <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>

              {/* Seguro Médico */}
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3 mt-6">Seguro Médico</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="insurance.hasInsurance"
                    checked={formData.insurance.hasInsurance}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                    ¿Tiene seguro médico?
                  </span>
                </label>
                
                {formData.insurance.hasInsurance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                        Aseguradora <span className="text-[rgb(var(--error))]">*</span>
                      </label>
                      <input
                        type="text"
                        name="insurance.provider"
                        value={formData.insurance.provider}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                        Número de Póliza <span className="text-[rgb(var(--error))]">*</span>
                      </label>
                      <input
                        type="text"
                        name="insurance.policyNumber"
                        value={formData.insurance.policyNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contacto de Emergencia */}
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3 mt-6">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Nombre Completo <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Relación <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                    required
                    placeholder="Padre, madre, esposo/a..."
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Teléfono <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>

              {/* Datos Médicos Críticos */}
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

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Alergias a Alimentos <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="allergies.food"
                    value={formData.allergies.food}
                    onChange={handleChange}
                    required
                    placeholder='Si ninguna, escribir "Ninguna"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Otras Alergias <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="allergies.others"
                    value={formData.allergies.others}
                    onChange={handleChange}
                    required
                    placeholder='Polen, latex, etc. Si ninguna: "Ninguna"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: SIGNOS VITALES */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-[rgb(var(--error))]" />
                Signos Vitales (Consulta Actual)
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

            {/* SECCIÓN 3: MOTIVO DE CONSULTA */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaStethoscope className="text-[rgb(var(--primary))]" />
                Motivo de Consulta
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
              </div>
            </div>

            {/* SECCIÓN 4: HISTORIAL MÉDICO */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaFileMedical className="text-[rgb(var(--warning))]" />
                Historial Médico
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Enfermedades Crónicas <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="medicalHistory.chronicDiseases"
                    value={formData.medicalHistory.chronicDiseases}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder='Diabetes, hipertensión, asma, etc. Si ninguna: "Ninguna"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Medicamentos Actuales <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="medicalHistory.currentMedications"
                    value={formData.medicalHistory.currentMedications}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder='Nombre y dosis. Si ninguno: "Ninguno"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Antecedentes Familiares <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <textarea
                    name="medicalHistory.familyHistory"
                    value={formData.medicalHistory.familyHistory}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder='Enfermedades hereditarias. Si ninguna: "Ninguna"'
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* ODONTOGRAMA (SOLO ODONTÓLOGOS) */}
            {isOdontologist && (
              <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
                <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  🦷 Odontograma Digital
                </h2>
                
                <Odontogram
                  teeth={formData.odontogram?.teeth || []}
                  onChange={(teeth) => setFormData(prev => ({
                    ...prev,
                    odontogram: {
                      teeth,
                      lastUpdate: new Date()
                    }
                  }))}
                />
              </div>
            )}

            {/* FOTOS CLÍNICAS */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaCamera className="text-[rgb(var(--info))]" />
                Evidencia Clínica - Fotos (Opcional - Máx. 20)
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Descripción de la foto
                    </label>
                    <input
                      type="text"
                      value={currentPhotoDescription}
                      onChange={(e) => setCurrentPhotoDescription(e.target.value)}
                      placeholder="Ej: Lesión en brazo derecho"
                      className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                    />
                  </div>
                  
                  <input
                    ref={clinicalPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleClinicalPhotoUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.setAttribute('capture', 'environment');
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          if (clinicalPhotos.length >= 20) {
                            alert('Máximo 20 fotos clínicas permitidas');
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            alert('La foto no debe superar 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newPhoto: ClinicalPhoto = {
                              url: reader.result as string,
                              description: currentPhotoDescription || 'Sin descripción',
                              uploadedAt: new Date().toISOString()
                            };
                            const updatedPhotos = [...clinicalPhotos, newPhoto];
                            setClinicalPhotos(updatedPhotos);
                            setFormData(prev => ({
                              ...prev,
                              files: { ...prev.files, clinicalPhotos: updatedPhotos }
                            }));
                            setCurrentPhotoDescription('');
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    disabled={clinicalPhotos.length >= 20}
                    className="px-4 py-2 bg-[rgb(var(--success))] text-white rounded-lg hover:bg-[rgb(var(--success))/0.8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaCamera /> Tomar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => clinicalPhotoInputRef.current?.click()}
                    disabled={clinicalPhotos.length >= 20}
                    className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPlus /> Subir
                  </button>
                </div>

                <p className="text-xs text-[rgb(var(--gray-medium))]">
                  {clinicalPhotos.length}/20 fotos • Máximo 5MB por foto
                </p>

                {/* Grid de fotos */}
                {clinicalPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {clinicalPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.description}
                          className="w-full h-32 object-cover rounded-lg border border-[rgb(var(--border))]"
                        />
                        <button
                          type="button"
                          onClick={() => removeClinicalPhoto(index)}
                          className="absolute -top-2 -right-2 bg-[rgb(var(--error))] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                        <p className="text-xs text-[rgb(var(--foreground))] mt-1 truncate">
                          {photo.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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

            {/* CONSENTIMIENTO Y FIRMA */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaSignature className="text-[rgb(var(--accent))]" />
                Consentimiento Informado
              </h2>
              
              <div className="space-y-4">
                <div className="bg-[rgb(var(--background))] rounded-lg p-4">
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
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                        Nombre completo (quien firma) <span className="text-[rgb(var(--error))]">*</span>
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
                        Firma Digital <span className="text-[rgb(var(--error))]">*</span>
                      </label>
                      <div className="border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-2">
                        <canvas
                          ref={signatureCanvasRef}
                          width={600}
                          height={200}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full border border-[rgb(var(--border))] rounded cursor-crosshair bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="mt-2 text-sm text-[rgb(var(--error))] hover:underline"
                      >
                        Limpiar firma
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-[rgb(var(--background))] p-4 border-t border-[rgb(var(--border))]">
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
                    <span>💾 Guardar Historia Clínica Completa</span>
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