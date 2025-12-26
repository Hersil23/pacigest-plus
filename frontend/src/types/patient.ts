export interface Patient {
  _id: string;
  doctorIds: string[];
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  weight?: number;
  height?: number;
  allergies?: {
    list: Array<{
      name: string;
      severity: 'leve' | 'moderada' | 'severa';
    }>;
    additionalNotes?: string;
  };
  chronicDiseases?: string[];
  habits?: {
    smoker: boolean;
    smokerDetails?: string;
    alcohol: boolean;
    alcoholDetails?: string;
  };
  familyHistory?: string;
  insuranceInfo?: {
    hasInsurance: boolean;
    provider?: string;
    policyNumber?: string;
    validUntil?: string;
  };
  language: 'es' | 'en';
  medicalRecordNumber: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'deceased' | 'transferred';
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  age?: number;
  bmi?: number;
}

export interface PatientFormData {
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  email: string;
  phone: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  weight?: number;
  height?: number;
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}