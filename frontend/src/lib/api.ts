const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Obtener token del localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Headers con autenticación
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// ============================================
// PACIENTES
// ============================================

export const patientsApi = {
  // Obtener todos los pacientes
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${API_URL}/patients?${queryParams.toString()}`,
      {
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener pacientes');
    }

    return response.json();
  },

  // Obtener un paciente por ID
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al obtener paciente');
    }

    return response.json();
  },

  // Crear paciente
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear paciente');
    }

    return response.json();
  },

  // Actualizar paciente
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar paciente');
    }

    return response.json();
  },

  // Eliminar paciente (soft delete)
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al eliminar paciente');
    }

    return response.json();
  },

  // Restaurar paciente
  restore: async (id: string) => {
    const response = await fetch(`${API_URL}/patients/${id}/restore`, {
      method: 'PATCH',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al restaurar paciente');
    }

    return response.json();
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await fetch(`${API_URL}/patients/stats`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    return response.json();
  }
};

// ============================================
// AUTENTICACIÓN
// ============================================

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    return response.json();
  },

  register: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrarse');
    }

    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario actual');
    }

    const result = await response.json();
    return result.data;
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    return response.json();
  }
};