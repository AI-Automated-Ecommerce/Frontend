import api from './api';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
    category?: string;
    imageUrl?: string;
    isActive: boolean;
}

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data as Product[];
};
