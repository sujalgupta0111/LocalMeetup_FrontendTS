import { api } from './client';
import type{ ApiResponse, User, UserSearchResult } from '../types';

export const usersApi = {
  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/users/me');
    return res.data.data!;
  },

  updateMe: async (payload: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<User> => {
    const res = await api.put<ApiResponse<User>>('/users/me', payload);
    return res.data.data!;
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data!;
  },

  searchUsers: async (query: string): Promise<UserSearchResult[]> => {
    const res = await api.get<ApiResponse<UserSearchResult[]>>(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data.data || [];
  },
};
