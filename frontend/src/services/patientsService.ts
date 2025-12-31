import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

export const getAll = async (filters?: any) => {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page);
    if (filters?.limit) params.append('limit', filters.limit);

    const response = await axios.get(`${API_URL}/patients?${params.toString()}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const getById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};