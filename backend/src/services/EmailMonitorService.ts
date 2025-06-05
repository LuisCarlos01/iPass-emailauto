import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import EmailProcessorService from './EmailProcessorService';

const prisma = new PrismaClient();

class EmailMonitorService {
  private oauth2Client: OAuth2Client;
  private monitoringIntervals: Map<string, NodeJS.Timeout>;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.monitoringIntervals = new Map();
  }

  private async getEmailContent(gmail: any, messageId: string): Promise<{
    from: string;
    to: string;
    subject: string;
    body: string;
  }> {
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const headers = message.data.payload.headers;
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';

    let body = '';
    if (message.data.payload.parts) {
      const textPart = message.data.payload.parts.find(
        (part: any) => part.mimeType === 'text/plain'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (message.data.payload.body.data) {
      body = Buffer.from(message.data.payload.body.data, 'base64').toString();
    }

    return { from, to, subject, body };
  }

  private async processNewEmails(userId: string, accessToken: string) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Busca emails não lidos na caixa de entrada
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:inbox is:unread'
      });

      const messages = response.data.messages || [];

      for (const message of messages) {
        const emailContent = await this.getEmailContent(gmail, message.id);

        await EmailProcessorService.processEmail({
          messageId: message.id,
          ...emailContent,
          userId
        }, accessToken);
      }
    } catch (error) {
      console.error('Error processing new emails:', error);
    }
  }

  async startMonitoring(userId: string, accessToken: string) {
    // Para qualquer monitoramento existente para este usuário
    this.stopMonitoring(userId);

    // Inicia um novo intervalo de monitoramento
    const interval = setInterval(
      () => this.processNewEmails(userId, accessToken),
      60000 // Verifica a cada minuto
    );

    this.monitoringIntervals.set(userId, interval);

    // Processa imediatamente os emails existentes
    await this.processNewEmails(userId, accessToken);
  }

  stopMonitoring(userId: string) {
    const interval = this.monitoringIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(userId);
    }
  }

  isMonitoring(userId: string): boolean {
    return this.monitoringIntervals.has(userId);
  }
}

export default new EmailMonitorService(); 