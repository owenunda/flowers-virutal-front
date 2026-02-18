import api from './api';

export interface ConsolidatedItem {
  id: string;
  productId: string;
  totalQty: number;
  unitPrice: string;
  lineTotal: string;
  product: {
    id: string;
    sku: string;
    name: string;
    basePrice: string;
  };
}

export interface ConsolidatedOrder {
  id: string;
  providerId: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    email: string;
  };
  items: ConsolidatedItem[];
}

export const consolidationService = {
  findAll: async (): Promise<ConsolidatedOrder[]> => {
    const response = await api.get<ConsolidatedOrder[]>('/consolidation');
    return response.data;
  },

  findOne: async (id: string): Promise<ConsolidatedOrder> => {
    const response = await api.get<ConsolidatedOrder>(`/consolidation/${id}`);
    return response.data;
  },

  run: async (): Promise<{ consolidatedOrders: ConsolidatedOrder[]; ordersProcessed: number }> => {
    const response = await api.post('/consolidation/run');
    return response.data;
  },
};
