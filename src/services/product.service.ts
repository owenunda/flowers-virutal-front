import api from './api';
import { Product } from '../types';

export const productService = {
  findAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  create: async (product: Omit<Product, 'id'>) => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  update: async (id: string, product: Partial<Product>) => {
    const response = await api.patch<Product>(`/products/${id}`, product);
    return response.data;
  }
};
