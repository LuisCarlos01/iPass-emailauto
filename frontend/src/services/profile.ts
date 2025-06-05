import { api } from './api';

export interface Profile {
  id: string;
  name: string;
  email: string;
  emailSettings: {
    imapHost: string;
    imapPort: number;
    imapUser: string;
    imapPassword: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromName: string;
    fromEmail: string;
  };
}

export interface UpdateProfileDTO {
  name: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateEmailSettingsDTO {
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPassword?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  fromName: string;
  fromEmail: string;
}

export const profileService = {
  get: async (): Promise<Profile> => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (data: UpdateProfileDTO): Promise<Profile> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  updateEmailSettings: async (data: UpdateEmailSettingsDTO): Promise<Profile> => {
    const response = await api.put('/profile/email-settings', data);
    return response.data;
  },

  testEmailSettings: async (): Promise<void> => {
    await api.post('/profile/test-email-settings');
  },
}; 