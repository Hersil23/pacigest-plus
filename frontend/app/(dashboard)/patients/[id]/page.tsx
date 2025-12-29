"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { patientsApi, consultationsApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaPrint, FaFilePdf, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaTooth, FaStethoscope, FaCamera, FaSignature, FaTrash, FaUpload, FaPlus, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  patientPhoto?: string;
  clinicalPhotos?: {
    _id: string;
    url: string;
    description: string;
    uploadedAt: string;
  }[];
  signature?: string;
  odontogram?: {
    teeth: {
      number: number;
      status: string;
      notes?: string;
    }[];
    lastUpdate: string;
  };
  consultations?: Consultation[];
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    loadPatient();
    loadConsultations();
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

  const loadConsultations = async () => {
    try {
      setLoadingConsultations(true);
      const response = await consultationsApi.getAll(params.id as string, 'all');
      setConsultations(response.data || []);
    } catch (err: any) {
      console.error('Error al cargar consultas:', err);
    } finally {
      setLoadingConsultations(false);
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta consulta? Esta acción no se puede deshacer.')) return;

    try {
      await consultationsApi.delete(params.id as string, consultationId);
      alert('Consulta eliminada exitosamente');
      loadConsultations();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la consulta');
    }
  };

  // ============================================
  // GESTIÓN DE FOTOS
  // ============================================

  const handleDeletePatientPhoto = async () => {
    if (!confirm('¿Estás seguro de eliminar la foto del paciente?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/photos/patients/${params.id}/photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Foto eliminada exitosamente');
        loadPatient();
      } else {
        alert('Error al eliminar la foto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la foto');
    }
  };

  const handleUploadPatientPhoto = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('La foto no debe superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/photos/patients/${params.id}/photo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ photoData: reader.result })
        });

        if (response.ok) {
          alert('Foto subida exitosamente');
          loadPatient();
        } else {
          alert('Error al subir la foto');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al subir la foto');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteClinicalPhoto = async (photoId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta foto clínica?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/photos/patients/${params.id}/clinical-photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Foto eliminada exitosamente');
        loadPatient();
      } else {
        alert('Error al eliminar la foto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la foto');
    }
  };

  const handleUploadClinicalPhotos = async (files: FileList) => {
    const photos: { photoData: string; description: string }[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`La foto ${file.name} supera 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        photos.push({
          photoData: reader.result as string,
          description: file.name
        });
        
        processed++;
        
        if (processed === files.length) {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/photos/patients/${params.id}/clinical-photos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ photos })
            });

            if (response.ok) {
              alert(`${photos.length} foto(s) subida(s) exitosamente`);
              loadPatient();
            } else {
              alert('Error al subir las fotos');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Error al subir las fotos');
          }
        }
      };
      reader.readAsDataURL(file);
    });
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
            
            {/* MÓVIL: Layout vertical */}
            <div className="flex flex-col gap-4 md:hidden">
              {/* Foto y nombre */}
              <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0 w-24 h-24">
                  {patient.patientPhoto ? (
                    <>
                      <img 
                        src={patient.patientPhoto} 
                        alt={`${patient.firstName} ${patient.lastName}`}
                        className="w-full h-full rounded-full object-cover border-4 border-[rgb(var(--primary))] shadow-lg aspect-square"
                      />
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUploadPatientPhoto(e.target.files[0])}
                          className="hidden"
                          id="change-patient-photo-mobile"
                        />
                        <label
                          htmlFor="change-patient-photo-mobile"
                          className="p-1.5 bg-[rgb(var(--primary))] text-white rounded-full cursor-pointer hover:bg-[rgb(var(--primary-hover))] transition-colors"
                          title="Cambiar foto"
                        >
                          <FaCamera className="text-xs" />
                        </label>
                        <button
                          onClick={handleDeletePatientPhoto}
                          className="p-1.5 bg-[rgb(var(--error))] text-white rounded-full hover:bg-[#dc2626] transition-colors"
                          title="Eliminar foto"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full rounded-full bg-[rgb(var(--gray-light))] flex items-center justify-center border-4 border-[rgb(var(--border))] aspect-square">
                        <FaUser className="text-4xl text-[rgb(var(--gray-medium))]" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadPatientPhoto(e.target.files[0])}
                        className="hidden"
                        id="add-patient-photo-mobile"
                      />
                      <label
                        htmlFor="add-patient-photo-mobile"
                        className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        title="Agregar foto"
                      >
                        <FaCamera className="text-xl text-white" />
                      </label>
                    </>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-[rgb(var(--foreground))] truncate">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-xs text-[rgb(var(--gray-medium))] truncate">
                    {patient.medicalRecordNumber}
                  </p>
                  <p className="text-xs text-[rgb(var(--gray-medium))]">
                    {patient.age} años
                  </p>
                </div>
              </div>
              
              {/* Botones en móvil */}
              <div className="grid grid-cols-3 gap-2">
                <Link 
                  href={`/patients/${patient._id}/edit`}
                  className="px-3 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition-colors flex items-center justify-center gap-1 text-xs shadow-md"
                >
                  <FaEdit /> Editar
                </Link>
                <button className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center justify-center gap-1 text-xs shadow-md">
                  <FaPrint /> Imprimir
                </button>
                <button className="px-3 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors flex items-center justify-center gap-1 text-xs shadow-md">
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>

            {/* TABLET Y DESKTOP: Layout horizontal */}
            <div className="hidden md:flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0 w-24 h-24">
                  {patient.patientPhoto ? (
                    <>
                      <img 
                        src={patient.patientPhoto} 
                        alt={`${patient.firstName} ${patient.lastName}`}
                        className="w-full h-full rounded-full object-cover border-4 border-[rgb(var(--primary))] shadow-lg aspect-square"
                      />
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUploadPatientPhoto(e.target.files[0])}
                          className="hidden"
                          id="change-patient-photo"
                        />
                        <label
                          htmlFor="change-patient-photo"
                          className="p-2 bg-[rgb(var(--primary))] text-white rounded-full cursor-pointer hover:bg-[rgb(var(--primary-hover))] transition-colors"
                          title="Cambiar foto"
                        >
                          <FaCamera className="text-sm" />
                        </label>
                        <button
                          onClick={handleDeletePatientPhoto}
                          className="p-2 bg-[rgb(var(--error))] text-white rounded-full hover:bg-[#dc2626] transition-colors"
                          title="Eliminar foto"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full rounded-full bg-[rgb(var(--gray-light))] flex items-center justify-center border-4 border-[rgb(var(--border))] aspect-square">
                        <FaUser className="text-4xl text-[rgb(var(--gray-medium))]" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadPatientPhoto(e.target.files[0])}
                        className="hidden"
                        id="add-patient-photo"
                      />
                      <label
                        htmlFor="add-patient-photo"
                        className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        title="Agregar foto"
                      >
                        <FaCamera className="text-2xl text-white" />
                      </label>
                    </>
                  )}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                    {patient.firstName} {patient.secondName} {patient.lastName} {patient.secondLastName}
                  </h1>
                  <p className="text-[rgb(var(--gray-medium))] mt-1">
                    Expediente: {patient.medicalRecordNumber} • {patient.age} años
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Link 
                  href={`/patients/${patient._id}/edit`}
                  className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <FaEdit /> Editar
                </Link>
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

          {/* HISTORIAL DE CONSULTAS - NUEVO */}
          <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
                <FaStethoscope className="text-[rgb(var(--primary))]" />
                Historial de Consultas ({consultations.length})
              </h2>
              
              <Link
                href={`/patients/${patient._id}/consultations/new`}
                className="px-4 py-2 bg-[rgb(var(--success))] text-white rounded-lg hover:bg-[#16a34a] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaPlus /> Nueva Consulta
              </Link>
            </div>

            {loadingConsultations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))] mx-auto mb-2"></div>
                <p className="text-[rgb(var(--gray-medium))]">Cargando consultas...</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8 text-[rgb(var(--gray-medium))]">
                <FaStethoscope className="text-4xl mx-auto mb-2 opacity-30" />
                <p>No hay consultas registradas.</p>
                <p className="text-sm mt-2">Haz clic en "Nueva Consulta" para agregar la primera.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.slice(0, visibleCount).map((consultation, index) => (
                  <div 
                    key={consultation._id}
                    className="border border-[rgb(var(--border))] rounded-lg overflow-hidden"
                  >
                    {/* Header de la consulta */}
                    <div 
                      className="flex items-center justify-between p-4 bg-[rgb(var(--background))] cursor-pointer hover:bg-[rgb(var(--gray-very-light))] transition-colors"
                      onClick={() => setExpandedConsultation(expandedConsultation === consultation._id ? null : consultation._id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgb(var(--primary))] text-white font-bold text-sm">
                          {consultations.length - index}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[rgb(var(--foreground))]">
                            {consultation.reason.substring(0, 60)}{consultation.reason.length > 60 ? '...' : ''}
                          </p>
                          <p className="text-xs text-[rgb(var(--gray-medium))] flex items-center gap-2 mt-1">
                            <FaClock className="text-[10px]" />
                            {new Date(consultation.consultationDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/patients/${patient._id}/consultations/${consultation._id}/edit`}
                          className="p-2 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.1)] rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="Editar consulta"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConsultation(consultation._id);
                          }}
                          className="p-2 text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.1)] rounded-lg transition-colors"
                          title="Eliminar consulta"
                        >
                          <FaTrash />
                        </button>
                        {expandedConsultation === consultation._id ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {/* Contenido expandido */}
                    {expandedConsultation === consultation._id && (
                      <div className="p-4 space-y-4 border-t border-[rgb(var(--border))]">
                        <div>
                          <h4 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Motivo de Consulta:</h4>
                          <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--background))] p-3 rounded-lg">
                            {consultation.reason}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Síntomas:</h4>
                          <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--background))] p-3 rounded-lg">
                            {consultation.symptoms}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Duración:</h4>
                          <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--background))] p-3 rounded-lg">
                            {consultation.symptomsDuration}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">📋 Notas del Médico:</h4>
                          <p className="text-[rgb(var(--foreground))] bg-[rgb(var(--warning)/0.1)] p-4 rounded-lg border-2 border-[rgb(var(--warning))]">
                            {consultation.doctorNotes}
                          </p>
                        </div>

                        {consultation.vitalSigns && (
                          <div>
                            <h4 className="text-sm font-semibold text-[rgb(var(--gray-medium))] mb-2">Signos Vitales:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {consultation.vitalSigns.bloodPressure && (
                                <div className="bg-[rgb(var(--background))] p-3 rounded-lg">
                                  <p className="text-xs text-[rgb(var(--gray-medium))]">Presión Arterial</p>
                                  <p className="font-semibold text-[rgb(var(--foreground))]">{consultation.vitalSigns.bloodPressure}</p>
                                </div>
                              )}
                              {consultation.vitalSigns.temperature && (
                                <div className="bg-[rgb(var(--background))] p-3 rounded-lg">
                                  <p className="text-xs text-[rgb(var(--gray-medium))]">Temperatura</p>
                                  <p className="font-semibold text-[rgb(var(--foreground))]">{consultation.vitalSigns.temperature}°C</p>
                                </div>
                              )}
                              {consultation.vitalSigns.heartRate && (
                                <div className="bg-[rgb(var(--background))] p-3 rounded-lg">
                                  <p className="text-xs text-[rgb(var(--gray-medium))]">Frecuencia Cardíaca</p>
                                  <p className="font-semibold text-[rgb(var(--foreground))]">{consultation.vitalSigns.heartRate} bpm</p>
                                </div>
                              )}
                              {consultation.vitalSigns.respiratoryRate && (
                                <div className="bg-[rgb(var(--background))] p-3 rounded-lg">
                                  <p className="text-xs text-[rgb(var(--gray-medium))]">Frecuencia Respiratoria</p>
                                  <p className="font-semibold text-[rgb(var(--foreground))]">{consultation.vitalSigns.respiratoryRate} rpm</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-[rgb(var(--gray-medium))] pt-2 border-t border-[rgb(var(--border))]">
                          Última actualización: {new Date(consultation.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Botón "Ver más" */}
                {consultations.length > visibleCount && (
                  <button
                    onClick={() => setVisibleCount(prev => prev + 5)}
                    className="w-full py-3 bg-[rgb(var(--background))] text-[rgb(var(--primary))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] transition-colors font-medium"
                  >
                    Ver 5 consultas anteriores ({consultations.length - visibleCount} restantes)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Información de Consulta ANTIGUA (Deprecated) */}
          {(patient.consultation?.reason || patient.consultation?.symptoms || patient.doctorNotes) && (
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
                  <FaStethoscope className="text-[rgb(var(--primary))]" />
                  Consulta Inicial (Sistema Antiguo)
                </h2>
                <span className="px-2 py-1 bg-[rgb(var(--warning)/0.2)] text-[rgb(var(--warning))] text-xs rounded">
                  Deprecado
                </span>
              </div>
              
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

          {/* Fotos Clínicas CON GESTIÓN */}
          <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
                <FaCamera className="text-[rgb(var(--info))]" />
                Evidencia Clínica ({patient.clinicalPhotos?.length || 0} fotos)
              </h2>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleUploadClinicalPhotos(e.target.files)}
                  className="hidden"
                  id="upload-clinical-photos"
                />
                <label
                  htmlFor="upload-clinical-photos"
                  className="px-4 py-2 bg-[rgb(var(--success))] text-white rounded-lg hover:bg-[#16a34a] transition-colors flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <FaPlus /> Agregar Fotos
                </label>
              </div>
            </div>
            
            {patient.clinicalPhotos && patient.clinicalPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {patient.clinicalPhotos.map((photo) => (
                  <div key={photo._id} className="group relative">
                    <img
                      src={photo.url}
                      alt={photo.description}
                      className="w-full h-40 object-cover rounded-lg border border-[rgb(var(--border))] cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(photo.url, '_blank')}
                    />
                    <button
                      onClick={() => handleDeleteClinicalPhoto(photo._id)}
                      className="absolute -top-2 -right-2 p-2 bg-[rgb(var(--error))] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-[#dc2626]"
                      title="Eliminar foto"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs truncate">{photo.description}</p>
                      <p className="text-[10px] text-gray-300">{new Date(photo.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[rgb(var(--gray-medium))]">
                <FaCamera className="text-4xl mx-auto mb-2 opacity-30" />
                <p>No hay fotos clínicas. Haz click en "Agregar Fotos" para subir.</p>
              </div>
            )}
          </div>

          {/* Firma Digital */}
          {patient.signature && (
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <FaSignature className="text-[rgb(var(--accent))]" />
                Firma del Paciente
              </h2>
              
              <div className="bg-white border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-4 inline-block">
                <img
                  src={patient.signature}
                  alt="Firma del paciente"
                  className="max-w-md h-32 object-contain"
                />
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