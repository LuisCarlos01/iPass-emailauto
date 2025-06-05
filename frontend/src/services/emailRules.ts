import { api } from './api';

export interface EmailRule {
  id: string;
  name: string;
  fromEmail: string;
  subject: string | null;
  body: string | null;
  response: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailRuleDTO {
  name: string;
  fromEmail: string;
  subject?: string;
  body?: string;
  response: string;
  isActive: boolean;
}

export interface UpdateEmailRuleDTO extends CreateEmailRuleDTO {}

export const emailRulesService = {
  list: async (): Promise<EmailRule[]> => {
    const response = await api.get('/email-rules');
    return response.data;
  },

  create: async (data: CreateEmailRuleDTO): Promise<EmailRule> => {
    const response = await api.post('/email-rules', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmailRuleDTO): Promise<EmailRule> => {
    const response = await api.put(`/email-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/email-rules/${id}`);
  },

  toggleActive: async (id: string): Promise<EmailRule> => {
    const response = await api.patch(`/email-rules/${id}/toggle-active`);
    return response.data;
  },
}; 