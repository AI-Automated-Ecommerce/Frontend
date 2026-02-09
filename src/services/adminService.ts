import axios from 'axios';
import { Order, Product, Customer } from '@/types';

const API_URL = 'https://backend-2mhf.onrender.com';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_URL}/admin/stats`);
  return response.data;
};

export const getAdminOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_URL}/admin/orders`);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
  await axios.put(`${API_URL}/admin/orders/${orderId}/status`, { status });
};

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await axios.get(`${API_URL}/admin/customers`);
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}/admin/products`);
  return response.data;
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await axios.post(`${API_URL}/products`, product);
  return response.data;
};

// We need to fetch categories to map name <-> id
interface Category {
    id: number;
    name: string;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await axios.put(`${API_URL}/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/products/${id}`);
};

export const uploadImage = async (file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/admin/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
