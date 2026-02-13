import api from './api';
import { Order, Product, Customer } from '@/types';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminOrders = async (): Promise<Order[]> => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
  await api.put(`/admin/orders/${orderId}/status`, { status });
};

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/admin/products');
  return response.data;
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

// We need to fetch categories to map name <-> id
interface Category {
    id: number;
    name: string;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const uploadImage = async (file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Customer Chats APIs
export interface ChatConversation {
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageRole: 'user' | 'assistant';
  messageCount: number;
  ongoingOrders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
  hasUnread: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  joinedDate: string;
  messages: ChatMessage[];
  orders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    itemCount?: number;
    paymentMethod?: string;
  }[];
}

export const getCustomerChats = async (): Promise<ChatConversation[]> => {
  const response = await api.get('/admin/chats');
  return response.data;
};

export const getCustomerChatHistory = async (phoneNumber: string): Promise<ChatHistory> => {
  const response = await api.get(`/admin/chats/${phoneNumber}`);
  return response.data;
};

export const sendAdminMessage = async (phoneNumber: string, data: { message: string }): Promise<{ status: string; message: string }> => {
  const response = await api.post(`/admin/chats/${phoneNumber}/send`, data);
  return response.data;
};
