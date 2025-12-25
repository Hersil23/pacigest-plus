// URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialty?: string;
  licenseNumber?: string;
  selectedPlan?: string;
  billingCycle?: string;
}
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  message?: string;
}

// Servicio de autenticación
class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register
  async register(userData: RegisterData): Promise<AuthResponse> {
  const { selectedPlan, billingCycle, ...restData } = userData;

  const requestData = {
    ...restData,
    subscription: {
      plan: selectedPlan || 'trial',
      billingCycle: billingCycle || 'monthly'
    }
  };

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al registrarse');
  }

  // El backend devuelve userId y requiere verificación de email
  // Por ahora, guardamos el userId para el siguiente paso
  if (data.userId) {
    localStorage.setItem('pendingUserId', data.userId);
    localStorage.setItem('pendingEmail', userData.email);
  }

  return data;
}

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  }

  // Obtener token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Decodificar JWT
  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Verificar expiración del token
  isTokenExpired(): boolean {
    const user = this.getUserFromToken();
    if (!user || !user.exp) return true;
    return Date.now() >= user.exp * 1000;
  }
}

export default new AuthService();