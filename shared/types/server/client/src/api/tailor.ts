import type { ITailorProfile } from '@shared/types';
import api from './axios';

export const getTailorProfile = async (id: string) => {
  const { data } = await api.get(`/tailors/${id}`);
  return data;
};

export interface TailorOption {
  _id: string;
  businessName: string;
  userId: { firstName: string; lastName: string };
}

export const getTailors = async (): Promise<TailorOption[]> => {
  const { data } = await api.get('/tailors', { params: { limit: 50 } });
  return data.data.tailors;
};

export const createTailorProfile = async (profileData: Omit<ITailorProfile, '_id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'rating' | 'totalReviews' | 'totalOrders' | 'completionRate'>) => {
  const { data } = await api.post('/tailors', profileData);
  return data;
};

export const updateTailorProfile = async (id: string, profileData: Partial<ITailorProfile>) => {
  const { data } = await api.put(`/tailors/${id}`, profileData);
  return data;
};
