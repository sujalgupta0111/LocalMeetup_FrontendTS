import { api } from './client';
import type { ApiResponse, Notification, PaginatedData } from '../types';

export const notificationsApi = {
  getNotifications: async (page: number = 1, limit: number = 30): Promise<PaginatedData<Notification>> => {
    const res = await api.get<ApiResponse<PaginatedData<Notification>>>(`/notifications?page=${page}&limit=${limit}`);
    return res.data.data!;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return res.data.data?.unreadCount || 0;
  },
};
