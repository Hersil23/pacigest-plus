export interface Patient {
  _id: string;
  // Datos de consulta
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
  age?: number; // calculado
  gender: 'M' | 'F' | 'Otro';
  email: string;
  phone: string;
  secondaryPhone?: string;
  photoUrl?: string;
  
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
  
  // Representante legal (si es menor)
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
  
  // Signos vitales
  vitalSigns: {
    bloodPressure: string;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
    height: number;
    bmi?: number; // calculado
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
    // Odontología
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
    // Dermatología
    dermatology?: {
      skinType: 'seca' | 'grasa' | 'mixta' | 'sensible' | 'normal';
      skinAllergies: string;
      sunExposure: boolean;
      sunscreen: boolean;
      cosmeticProducts: string;
      moleChanges: boolean;
      observations: string;
    };
    // Cardiología
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
  
  // Archivos
  files: {
    patientPhoto?: string;
    labResults?: string[];
    xrays?: string[];
    reports?: string[];
    prescriptions?: string[];
    others?: string[];
  };
  
  // Consentimiento
  consent: {
    accepted: boolean;
    signature: string;
    signedBy: string;
    signedAt: string;
  };
  
  // PDF generado
  clinicalHistoryPDF?: {
    url: string;
    generatedAt: string;
    version: number;
  };
  
  // Metadatos
  medicalRecordNumber?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface PatientFormData extends Omit<Patient, '_id' | 'createdAt' | 'updatedAt' | 'medicalRecordNumber' | 'age' | 'bmi'> {}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}