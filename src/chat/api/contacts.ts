import { api } from './client';
import type { ApiResponse, Contact, ContactRequest, UserBlock } from '../types';

export const contactsApi = {
  getContacts: async (): Promise<Contact[]> => {
    const res = await api.get<ApiResponse<Contact[]>>('/contacts');
    return res.data.data || [];
  },

  sendRequest: async (receiverId: string): Promise<ContactRequest> => {
    const res = await api.post<ApiResponse<ContactRequest>>('/contacts/request', { receiverId });
    return res.data.data!;
  },

  acceptRequest: async (requestId: string): Promise<void> => {
    await api.post('/contacts/accept', { requestId });
  },

  rejectRequest: async (requestId: string): Promise<void> => {
    await api.post('/contacts/reject', { requestId });
  },

  removeContact: async (contactId: string): Promise<void> => {
    await api.delete(`/contacts/${contactId}`);
  },

  blockUser: async (targetUserId: string): Promise<void> => {
    await api.post('/contacts/block', { targetUserId });
  },

  unblockUser: async (targetUserId: string): Promise<void> => {
    await api.delete(`/contacts/block/${targetUserId}`);
  },

  getBlockedUsers: async (): Promise<UserBlock[]> => {
    const res = await api.get<ApiResponse<UserBlock[]>>('/contacts/blocked');
    return res.data.data || [];
  },

  getPendingRequests: async (): Promise<ContactRequest[]> => {
    const res = await api.get<ApiResponse<ContactRequest[]>>('/contacts/requests/pending');
    return res.data.data || [];
  },

  getSentRequests: async (): Promise<ContactRequest[]> => {
    const res = await api.get<ApiResponse<ContactRequest[]>>('/contacts/requests/sent');
    return res.data.data || [];
  },
};
