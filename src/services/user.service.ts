import api from './api';
import { UserProfile, Role } from '../types';

export const userService = {
  findAll: async (role?: Role): Promise<UserProfile[]> => {
    const params = role ? { role } : {};
    const response = await api.get<UserProfile[]>('/users', { params });
    return response.data;
  },
};
