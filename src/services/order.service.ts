import api from './api';
import { Order } from '../types';

export const orderService = {
  findAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  create: async (payload: { customerId: string, items: { productId: string, qty: number }[] }) => {
    // 1. Create order (Draft)
    const createResponse = await api.post<Order>('/orders', { customerId: payload.customerId });
    const orderId = createResponse.data.id;

    // 2. Add items to order
    await Promise.all(payload.items.map(async (item) => {
        try {
            await api.post(`/orders/${orderId}/items`, {
                productId: item.productId,
                qty: item.qty
            });
        } catch (e) {
            console.error(`Failed to add item ${item.productId} to order ${orderId}`, e);
            throw e; 
        }
    }));

    // 3. Submit order
    const submitResponse = await api.patch<Order>(`/orders/${orderId}/submit`);
    return submitResponse.data;
  },
  
  submit: async (id: string) => {
    const response = await api.patch<Order>(`/orders/${id}/submit`);
    return response.data;
  },

  decline: async (id: string) => {
    const response = await api.patch<Order>(`/orders/${id}/decline`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch<Order>(`/orders/${id}/approve`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.patch<Order>(`/orders/${id}/reject`);
    return response.data;
  },
  
  complete: async (id: string) => {
      const response = await api.patch<Order>(`/orders/${id}/complete`);
      return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<Order>(`/orders/${id}`);
    return response.data;
  },

  getConsolidated: async () => {
    // For Provider
    const response = await api.get('/consolidation');
    return response.data;
  }
};
