import { api } from './client';
import type { ApiResponse } from '../types';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const uploadsApi = {
  uploadFile: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<UploadResult>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data!;
  },
};
