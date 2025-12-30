"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientsApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTooth } from 'react-icons/fa';
import Odontogram from '@/components/Odontogram';
import { useAuth } from '@/contexts/AuthContext';

interface PatientFormData {
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  bloodType: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: {
    medications: string;
    food: string;
    others: string;
  };
  weight: number;
  height: number;
  odontogram?: {
    teeth: {
      number: number;
      status: string;
      notes?: string;
    }[];
    lastUpdate: Date;
  };
}

export default function EditPatientPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isOdontologist = (user?.specialty || '').toLowerCase().includes('odont');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    dateOfBirth: '',
    gender: 'M',
    bloodType: 'O+',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Venezuela'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    allergies: {
      medications: '',
      food: '',
      others: ''
    },
    weight: 0,
    height: 0,
    odontogram: {
      teeth: [],
      lastUpdate: new Date()
    }
  });

  useEffect(() => {
    loadPatient();
  }, [params.id]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getById(params.id as string);
      const patient = response.data;

      setFormData({
        firstName: patient.firstName || '',
        secondName: patient.secondName || '',
        lastName: patient.lastName || '',
        secondLastName: patient.secondLastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        secondaryPhone: patient.secondaryPhone || '',
        dateOfBirth: patient.dateOfBirth?.split('T')[0] || '',
        gender: patient.gender || 'M',
        bloodType: patient.bloodType || 'O+',
        address: {
          street: patient.address?.street || '',
          city: patient.address?.city || '',
          state: patient.address?.state || '',
          country: patient.address?.country || 'Venezuela'
        },
        emergencyContact: {
          name: patient.emergencyContact?.name || '',
          relationship: patient.emergencyContact?.relationship || '',
          phone: patient.emergencyContact?.phone || ''
        },
        allergies: {
          medications: patient.allergies?.medications || '',
          food: patient.allergies?.food || '',
          others: patient.allergies?.others || ''
        },
        weight: patient.weight || 0,
        height: patient.height || 0,
        odontogram: patient.odontogram || {
          teeth: [],
          lastUpdate: new Date()
        }
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        let newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
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
      await patientsApi.update(params.id as string, formData);
      router.push(`/patients/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar paciente');
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
            <p className="text-[rgb(var(--gray-medium))]">{t('patientDetail.loading')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[rgb(var(--background))] p-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/patients/${params.id}`}
              className="inline-flex items-center gap-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] mb-4"
            >
              <FaArrowLeft />
              <span>{t('patientForm.backToDetail')}</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              ✏️ {t('patientForm.editTitle')}
            </h1>
            <p className="text-[rgb(var(--gray-medium))] mt-1">
              {t('patientForm.subtitle')}
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
            
            {/* Datos Personales */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                {t('patientForm.personalData')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.firstName')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.secondName')}
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
                    {t('patientForm.lastName')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.secondLastName')}
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
                    {t('patientForm.dateOfBirth')} <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.gender')} <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  >
                    <option value="M">{t('patientForm.male')}</option>
                    <option value="F">{t('patientForm.female')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.email')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.phone')} <span className="text-[rgb(var(--error))]">*</span>
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

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.bloodType')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.weight')} <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.height')} <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                {t('patientForm.address')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.street')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.city')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.state')} <span className="text-[rgb(var(--error))]">*</span>
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
            </div>

            {/* Contacto de Emergencia */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                {t('patientForm.emergencyContact')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.contactName')} <span className="text-[rgb(var(--error))]">*</span>
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
                    {t('patientForm.relationship')} <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    {t('patientForm.contactPhone')} <span className="text-[rgb(var(--error))]">*</span>
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
            </div>

            {/* Alergias */}
            <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
                {t('patientForm.allergies')}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  {t('patientForm.allergies')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <input
                  type="text"
                  name="allergies.medications"
                  value={formData.allergies.medications}
                  onChange={handleChange}
                  required
                  placeholder={t('patientForm.allergiesPlaceholder')}
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>
            </div>

            {/* ODONTOGRAMA (SOLO ODONTÓLOGOS) */}
            {isOdontologist && (
              <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-6">
                <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <FaTooth className="text-[rgb(var(--primary))]" />
                  {t('patientForm.odontogram')}
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
                    <span>{t('patientForm.saving')}</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>💾 {t('patientForm.saveChanges')}</span>
                  </>
                )}
              </button>

              <Link
                href={`/patients/${params.id}`}
                className="px-6 py-3 bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--gray-very-light))] transition-colors font-medium text-center"
              >
                ❌ {t('common.cancel')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}