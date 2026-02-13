import { BusinessDetail, BusinessDetailCreate, BusinessDetailUpdate } from '@/types/business';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const businessService = {
  getAllDetails: async (): Promise<BusinessDetail[]> => {
    const response = await api.get('/business/details');
    return response.data;
  },

  createDetail: async (detail: BusinessDetailCreate): Promise<BusinessDetail> => {
    const response = await api.post('/business/details', detail);
    return response.data;
  },

  updateDetail: async (id: number, detail: BusinessDetailUpdate): Promise<BusinessDetail> => {
    const response = await api.put(`/business/details/${id}`, detail);
    return response.data;
  },

  deleteDetail: async (id: number): Promise<void> => {
    await api.delete(`/business/details/${id}`);
  },
};
