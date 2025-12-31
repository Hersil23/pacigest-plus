import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Obtener token de localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// ============================================
// TIPOS
// ============================================
export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  appointmentType: string;
  reasonForVisit: string;
  symptoms?: string[];
  status: string;
  notes?: string;
  privateNotes?: string;
  consultationFee?: number;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFilters {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentCreateData {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  appointmentType: string;
  reasonForVisit: string;
  symptoms?: string[];
  notes?: string;
  privateNotes?: string;
  consultationFee?: number;
}

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

// Obtener todas las citas con filtros
export const getAll = async (filters: AppointmentFilters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get(
      `${API_URL}/appointments?${params.toString()}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    throw error.response?.data || error;
  }
};

// Obtener cita por ID
export const getById = async (id: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/appointments/${id}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    throw error.response?.data || error;
  }
};

// Obtener citas por doctor
export const getByDoctor = async (doctorId: string, filters: AppointmentFilters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get(
      `${API_URL}/appointments/doctor/${doctorId}?${params.toString()}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    throw error.response?.data || error;
  }
};

// Obtener citas por paciente
export const getByPatient = async (patientId: string, filters: AppointmentFilters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get(
      `${API_URL}/appointments/patient/${patientId}?${params.toString()}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching patient appointments:', error);
    throw error.response?.data || error;
  }
};

// Obtener agenda del día
export const getTodaySchedule = async (doctorId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/appointments/today/${doctorId}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching today schedule:', error);
    throw error.response?.data || error;
  }
};

// Crear nueva cita
export const create = async (data: AppointmentCreateData) => {
  try {
    const response = await axios.post(
      `${API_URL}/appointments`,
      data,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    throw error.response?.data || error;
  }
};

// Actualizar cita
export const update = async (id: string, data: Partial<AppointmentCreateData>) => {
  try {
    const response = await axios.put(
      `${API_URL}/appointments/${id}`,
      data,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    throw error.response?.data || error;
  }
};

// Confirmar cita
export const confirm = async (id: string, confirmedBy: string = 'doctor') => {
  try {
    const response = await axios.patch(
      `${API_URL}/appointments/${id}/confirm`,
      { confirmedBy },
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    throw error.response?.data || error;
  }
};

// Cancelar cita
export const cancel = async (id: string, cancellationReason: string, cancelledBy: string = 'doctor') => {
  try {
    const response = await axios.patch(
      `${API_URL}/appointments/${id}/cancel`,
      { cancellationReason, cancelledBy },
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    throw error.response?.data || error;
  }
};

// Completar cita
export const complete = async (id: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/appointments/${id}/complete`,
      {},
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error completing appointment:', error);
    throw error.response?.data || error;
  }
};

// Eliminar cita (soft delete)
export const deleteAppointment = async (id: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/appointments/${id}`,
      getAuthHeader()
    );

    return response.data;
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    throw error.response?.data || error;
  }
};