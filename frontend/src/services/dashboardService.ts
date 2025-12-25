// URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Interfaz para las estadísticas del dashboard
export interface DashboardStats {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    specialty: string;
    profilePhotoUrl: string | null;
  };
  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string | null;
    trialDaysLeft: number | null;
  };
  stats: {
    totalPatients: number;
    appointmentsToday: number;
    upcomingAppointments: number;
    activePrescriptions: number;
  };
  todayAppointments: Array<{
    id: string;
    time: string;
    patient: string;
    reason: string;
    status: string;
  }>;
}

// Servicio de Dashboard
class DashboardService {
  // Obtener estadísticas del dashboard
  async getStats(): Promise<DashboardStats> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener estadísticas');
      }

      return result.data;
    } catch (error: any) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  }
}

export default new DashboardService();