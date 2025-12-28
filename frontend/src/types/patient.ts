export interface Patient {
  _id: string;
  
  // Datos de consulta (auto-generados)
  consultationDate: string;
  consultationTime: string;
  
  // Identificación
  documentType: 'cedula' | 'pasaporte' | 'partida';
  documentNumber: string;
  documentCountry: string;
  
  // Datos personales
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  dateOfBirth: string;
  age?: number; // calculado automáticamente
  gender: 'M' | 'F' | 'Otro';
  email: string;
  phone: string;
  secondaryPhone?: string;
  
  // Dirección
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  
  // Seguro médico
  insurance: {
    hasInsurance: boolean;
    provider?: string;
    policyNumber?: string;
    planType?: string;
    validUntil?: string;
  };
  
  // Representante legal (solo si es menor de 18)
  legalRepresentative?: {
    documentType: 'cedula' | 'pasaporte';
    documentNumber: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    relationship: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    sameAddress: boolean;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode?: string;
      country: string;
    };
  };
  
  // Contacto de emergencia
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Datos médicos críticos
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: {
    medications: string;
    food: string;
    others: string;
  };
  
  // Signos vitales (consulta actual)
  vitalSigns: {
    bloodPressure: string;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
    height: number;
    bmi?: number; // calculado automáticamente
  };
  
  // Motivo de consulta
  consultation: {
    reason: string;
    symptoms: string;
    symptomsDuration: string;
    previousTreatment: boolean;
    treatmentDetails?: string;
    recentConsultations: boolean;
    consultationDetails?: string;
  };
  
  // Historial médico
  medicalHistory: {
    chronicDiseases: string;
    currentMedications: string;
    hospitalizations: boolean;
    hospitalizationDetails?: string;
    surgeries: boolean;
    surgeryDetails?: string;
    bloodTransfusions: boolean;
    transfusionDate?: string;
    vaccination: {
      covid19: boolean;
      covid19Doses?: number;
      influenza: boolean;
      influenzaDate?: string;
      others: string;
    };
    familyHistory: string;
    lifestyle: {
      smoking: boolean;
      smokingQuantity?: number;
      smokingDuration?: string;
      alcohol: boolean;
      alcoholFrequency?: string;
      physicalActivity: 'sedentario' | 'leve' | 'moderado' | 'intenso';
      diet: string;
      dietObservations?: string;
    };
  };
  
  // Referencia médica
  referral: {
    wasReferred: boolean;
    referringDoctor?: string;
    specialty?: string;
    reason?: string;
  };
  
  // Información por especialidad (condicional)
  specialtyData?: {
    dentistry?: {
      lastCleaning: string;
      dentalPain: boolean;
      painLocation?: string;
      painIntensity?: number;
      gumsbleeding: boolean;
      sensitivity: boolean;
      orthodontics: boolean;
      orthodonticsDetails?: string;
      bruxism: boolean;
      observations: string;
    };
    dermatology?: {
      skinType: 'seca' | 'grasa' | 'mixta' | 'sensible' | 'normal';
      skinAllergies: string;
      sunExposure: boolean;
      sunscreen: boolean;
      cosmeticProducts: string;
      moleChanges: boolean;
      observations: string;
    };
    cardiology?: {
      usualBloodPressure: string;
      chestPain: 'nunca' | 'ocasional' | 'frecuente' | 'constante';
      chestPainDetails?: string;
      breathingDifficulty: boolean;
      breathingDetails?: string;
      palpitations: boolean;
      palpitationFrequency?: string;
      swelling: boolean;
      heartAttackHistory: boolean;
      heartAttackDate?: string;
      observations: string;
    };
  };
  
  // Notas del médico
  doctorNotes: string;
  // Odontograma (solo para odontólogos)
odontogram?: {
  teeth: {
    number: number; // 11-48 (FDI)
    status: 'sano' | 'caries' | 'obturacion' | 'ausente' | 'fractura' | 'corona' | 'implante' | 'endodoncia' | 'porExtraer';
    surfaces?: ('oclusal' | 'vestibular' | 'palatina' | 'mesial' | 'distal')[];
    notes?: string;
  }[];
  lastUpdate?: Date;
};
  // Archivos y fotos
  files: {
    // Foto del paciente (OBLIGATORIA)
    patientPhoto: string; // base64 o URL
    
    // Fotos clínicas (hasta 20 fotos con descripción)
    clinicalPhotos?: {
      url: string; // base64 o URL
      description: string;
      uploadedAt: string;
    }[];
    
    // Estudios médicos (opcionales)
    labResults?: string[];
    xrays?: string[];
    reports?: string[];
    prescriptions?: string[];
    others?: string[];
  };
  
  // Consentimiento informado
  consent: {
    accepted: boolean;
    signature: string; // base64 de la firma digital
    signedBy: string;
    signedAt: string;
  };
  
  // PDF generado automáticamente
  clinicalHistoryPDF?: {
    url: string;
    generatedAt: string;
    version: number;
  };
  
  // Metadatos
  medicalRecordNumber?: string; // generado por backend
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

// Interface para el formulario (sin campos auto-generados)
export interface PatientFormData extends Omit<
  Patient, 
  '_id' | 'createdAt' | 'updatedAt' | 'medicalRecordNumber' | 'age' | 'bmi' | 'clinicalHistoryPDF'
> {}

// Estadísticas de pacientes
export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

// Interface para foto clínica
export interface ClinicalPhoto {
  url: string;
  description: string;
  uploadedAt: string;
}
