import { api } from './client';
import type {
  Category, MenuItem, RestaurantTable, Order, OrderType, PaymentMethod, DashboardSummary,
} from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }).then((r) => r.data),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/categories/${id}`),
};

export const menuApi = {
  getAll: (categoryId?: number) =>
    api.get<MenuItem[]>('/menu', { params: categoryId ? { categoryId } : {} }).then((r) => r.data),
  create: (data: Partial<MenuItem>) => api.post<MenuItem>('/menu', data).then((r) => r.data),
  update: (id: number, data: Partial<MenuItem>) => api.put<MenuItem>(`/menu/${id}`, data).then((r) => r.data),
  toggleAvailability: (id: number) => api.patch<MenuItem>(`/menu/${id}/toggle-availability`).then((r) => r.data),
  remove: (id: number) => api.delete(`/menu/${id}`),
};

export const tableApi = {
  getAll: () => api.get<RestaurantTable[]>('/tables').then((r) => r.data),
  create: (data: Partial<RestaurantTable>) => api.post<RestaurantTable>('/tables', data).then((r) => r.data),
  updateStatus: (id: number, status: string) =>
    api.patch<RestaurantTable>(`/tables/${id}/status`, { status }).then((r) => r.data),
  remove: (id: number) => api.delete(`/tables/${id}`),
};

export const orderApi = {
  getAll: (range?: string) => api.get<Order[]>('/orders', { params: range ? { range } : {} }).then((r) => r.data),
  getActive: () => api.get<Order[]>('/orders/active').then((r) => r.data),
  getOne: (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  create: (data: {
    tableId?: number; orderType: OrderType; customerName?: string; customerPhone?: string;
    items: { menuItemId: number; quantity: number; notes?: string }[];
  }) => api.post<Order>('/orders', data).then((r) => r.data),
  addItems: (id: number, items: { menuItemId: number; quantity: number; notes?: string }[]) =>
    api.post<Order>(`/orders/${id}/items`, { items }).then((r) => r.data),
  removeItem: (orderId: number, itemId: number) =>
    api.delete<Order>(`/orders/${orderId}/items/${itemId}`).then((r) => r.data),
  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
  checkout: (id: number, paymentMethod: PaymentMethod, discountAmount?: number) =>
    api.post<Order>(`/orders/${id}/checkout`, { paymentMethod, discountAmount }).then((r) => r.data),
  cancel: (id: number) => api.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
};

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
};
