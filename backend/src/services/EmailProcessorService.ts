import { PrismaClient, Rule, Condition, Action, EmailLog } from '@prisma/client';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

interface EmailData {
  messageId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  userId: string;
}

class EmailProcessorService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  private async evaluateCondition(condition: Condition, email: EmailData): Promise<boolean> {
    const value = email[condition.field as keyof EmailData] as string;
    if (!value) return false;

    switch (condition.operator) {
      case 'contains':
        return value.toLowerCase().includes(condition.value.toLowerCase());
      case 'equals':
        return value.toLowerCase() === condition.value.toLowerCase();
      case 'startsWith':
        return value.toLowerCase().startsWith(condition.value.toLowerCase());
      case 'endsWith':
        return value.toLowerCase().endsWith(condition.value.toLowerCase());
      case 'matches':
        return new RegExp(condition.value, 'i').test(value);
      default:
        return false;
    }
  }

  private async executeAction(action: Action, email: EmailData, accessToken: string): Promise<void> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    switch (action.type) {
      case 'reply': {
        if (!action.template) return;

        const message = {
          to: email.from,
          subject: `Re: ${email.subject}`,
          text: action.template
        };

        await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: Buffer.from(
              `To: ${message.to}\r\n` +
              `Subject: ${message.subject}\r\n` +
              `Content-Type: text/plain; charset="UTF-8"\r\n` +
              `Content-Transfer-Encoding: 7bit\r\n\r\n` +
              `${message.text}`
            ).toString('base64')
          }
        });
        break;
      }

      case 'forward': {
        if (!action.to) return;

        const message = {
          to: action.to,
          subject: `Fwd: ${email.subject}`,
          text: `---------- Forwarded message ----------\n` +
                `From: ${email.from}\n` +
                `Date: ${new Date().toISOString()}\n` +
                `Subject: ${email.subject}\n` +
                `To: ${email.to}\n\n` +
                `${email.body}`
        };

        await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: Buffer.from(
              `To: ${message.to}\r\n` +
              `Subject: ${message.subject}\r\n` +
              `Content-Type: text/plain; charset="UTF-8"\r\n` +
              `Content-Transfer-Encoding: 7bit\r\n\r\n` +
              `${message.text}`
            ).toString('base64')
          }
        });
        break;
      }

      case 'archive': {
        await gmail.users.messages.modify({
          userId: 'me',
          id: email.messageId,
          requestBody: {
            removeLabelIds: ['INBOX']
          }
        });
        break;
      }

      case 'label': {
        if (!action.label) return;

        // Primeiro, verifica se o label existe
        const labels = await gmail.users.labels.list({ userId: 'me' });
        let labelId = labels.data.labels?.find(l => l.name === action.label)?.id;

        // Se não existe, cria
        if (!labelId) {
          const newLabel = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
              name: action.label,
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show'
            }
          });
          labelId = newLabel.data.id;
        }

        // Aplica o label
        if (labelId) {
          await gmail.users.messages.modify({
            userId: 'me',
            id: email.messageId,
            requestBody: {
              addLabelIds: [labelId]
            }
          });
        }
        break;
      }
    }
  }

  async processEmail(email: EmailData, accessToken: string): Promise<void> {
    try {
      // Verifica se o email já foi processado
      const existingLog = await prisma.emailLog.findUnique({
        where: { messageId: email.messageId }
      });

      if (existingLog) {
        return;
      }

      // Busca todas as regras ativas do usuário
      const rules = await prisma.rule.findMany({
        where: {
          userId: email.userId,
          isActive: true
        },
        include: {
          conditions: true,
          actions: true
        },
        orderBy: {
          priority: 'desc'
        }
      });

      // Cria o log do email
      const emailLog = await prisma.emailLog.create({
        data: {
          messageId: email.messageId,
          from: email.from,
          to: email.to,
          subject: email.subject,
          body: email.body,
          status: 'processing'
        }
      });

      // Processa cada regra
      for (const rule of rules) {
        // Verifica se todas as condições são atendidas
        const conditionsMet = await Promise.all(
          rule.conditions.map(condition => this.evaluateCondition(condition, email))
        );

        if (conditionsMet.every(met => met)) {
          // Executa todas as ações da regra
          for (const action of rule.actions) {
            await this.executeAction(action, email, accessToken);
          }
        }
      }

      // Atualiza o log como processado
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'processed' }
      });

    } catch (error) {
      console.error('Error processing email:', error);

      // Se houver um log, atualiza com o erro
      if (email.messageId) {
        await prisma.emailLog.update({
          where: { messageId: email.messageId },
          data: {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }

      throw error;
    }
  }

  async getEmailLogs(userId: string): Promise<EmailLog[]> {
    return prisma.emailLog.findMany({
      where: {
        Rule: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export default new EmailProcessorService(); 