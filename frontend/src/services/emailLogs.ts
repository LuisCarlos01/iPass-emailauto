import { api } from './api';

export interface EmailLog {
  id: string;
  fromEmail: string;
  subject: string;
  content: string;
  response: string;
  status: string;
  ruleId?: string;
  rule?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailLogFilters {
  status?: string;
  fromEmail?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const emailLogsService = {
  list: async (filters: EmailLogFilters = {}): Promise<{
    logs: EmailLog[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await api.get('/email-logs', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: string): Promise<EmailLog> => {
    const response = await api.get(`/email-logs/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/email-logs/${id}`);
  },

  export: async (filters: EmailLogFilters = {}): Promise<Blob> => {
    const response = await api.get('/email-logs/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
}; 