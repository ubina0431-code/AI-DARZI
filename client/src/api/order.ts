import type { IOrder } from '@shared/types';
import api from './axios';

export interface CreateOrderPayload {
  tailorProfileId: string;
  measurementProfileId?: string;
  title: string;
  description?: string;
  isOverseasOrder?: boolean;
}

export const createOrder = async (orderData: CreateOrderPayload) => {
  const { data } = await api.post('/orders', orderData);
  return data.data as IOrder;
};

export const getOrders = async (): Promise<IOrder[]> => {
  const { data } = await api.get('/orders');
  return data.data.orders;
};

export const updateOrderStatus = async (id: string, status: IOrder['status']) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data.data as IOrder;
};
