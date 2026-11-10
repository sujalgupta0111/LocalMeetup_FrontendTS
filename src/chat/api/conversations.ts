import { api } from './client';
import type { ApiResponse, Conversation } from '../types';

export const conversationsApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await api.get<ApiResponse<Conversation[]>>('/conversations');
    return res.data.data || [];
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    const res = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return res.data.data!;
  },

  createDirectConversation: async (targetUserId: string): Promise<Conversation> => {
    const res = await api.post<ApiResponse<Conversation>>('/conversations', { targetUserId });
    return res.data.data!;
  },

  createGroup: async (payload: {
    name: string;
    description?: string;
    avatarUrl?: string;
    memberIds: string[];
  }): Promise<Conversation> => {
    const res = await api.post<ApiResponse<Conversation>>('/groups', payload);
    return res.data.data!;
  },

  updateGroup: async (id: string, payload: {
    name?: string;
    description?: string;
    avatarUrl?: string;
  }): Promise<Conversation> => {
    const res = await api.put<ApiResponse<Conversation>>(`/groups/${id}`, payload);
    return res.data.data!;
  },

  addGroupMember: async (conversationId: string, userId: string): Promise<void> => {
    await api.post(`/groups/${conversationId}/members`, { userId });
  },

  removeGroupMember: async (conversationId: string, userId: string): Promise<void> => {
    await api.delete(`/groups/${conversationId}/members/${userId}`);
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },
};
