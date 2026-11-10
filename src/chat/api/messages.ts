import { api } from './client';
import type { ApiResponse, Message, MessageAttachment, PaginatedData } from '../types';

export const messagesApi = {
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedData<Message>> => {
    const res = await api.get<ApiResponse<PaginatedData<Message>>>(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  sendMessage: async (payload: {
    conversationId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
    replyToId?: string;
    isForwarded?: boolean;
    attachments?: Array<{
      fileUrl: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }>;
  }): Promise<Message> => {
    const res = await api.post<ApiResponse<Message>>('/messages', payload);
    return res.data.data!;
  },

  editMessage: async (id: string, content: string): Promise<Message> => {
    const res = await api.put<ApiResponse<Message>>(`/messages/${id}`, { content });
    return res.data.data!;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },

  reactToMessage: async (id: string, emoji: string): Promise<void> => {
    await api.post(`/messages/${id}/reactions`, { emoji });
  },

  removeReaction: async (id: string, emoji: string): Promise<void> => {
    await api.delete(`/messages/${id}/reactions?emoji=${encodeURIComponent(emoji)}`);
  },

  markRead: async (conversationId: string): Promise<void> => {
    await api.post(`/conversations/${conversationId}/messages/read`);
  },

  searchMessages: async (conversationId: string, query: string): Promise<Message[]> => {
    const res = await api.get<ApiResponse<Message[]>>(
      `/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`
    );
    return res.data.data || [];
  },

  getSharedMedia: async (conversationId: string): Promise<MessageAttachment[]> => {
    const res = await api.get<ApiResponse<MessageAttachment[]>>(`/conversations/${conversationId}/media`);
    return res.data.data || [];
  },
};
