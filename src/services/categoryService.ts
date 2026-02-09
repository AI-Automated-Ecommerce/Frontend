import api from './api';

export interface Category {
    id: number;
    name: string;
    description: string;
}

export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data as Category[];
};
