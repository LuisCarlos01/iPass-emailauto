import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { createTransport } from 'nodemailer';
import { prisma } from '../lib/prisma';

interface EmailMessage {
  fromEmail: string;
  subject: string | null;
  body: string | null;
}

export class EmailMonitorService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  async startMonitoring() {
    if (this.monitoringInterval) {
      return;
    }

    // Verificar e-mails a cada 1 minuto
    this.monitoringInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processEmails();
      }
    }, 60000);

    // Primeira execução imediata
    await this.processEmails();
  }

  async stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async processEmails() {
    try {
      this.isProcessing = true;

      // Buscar todos os usuários com configurações de e-mail
      const users = await prisma.user.findMany({
        where: {
          emailSettings: {
            isNot: null,
          },
        },
        include: {
          emailSettings: true,
          emailRules: {
            where: {
              isActive: true,
            },
          },
        },
      });

      // Processar e-mails para cada usuário
      for (const user of users) {
        if (!user.emailSettings) continue;

        try {
          await this.processUserEmails(user);
        } catch (error) {
          console.error(`Erro ao processar e-mails do usuário ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao processar e-mails:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processUserEmails(user: any) {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: user.emailSettings.imapUser,
        password: user.emailSettings.imapPassword,
        host: user.emailSettings.imapHost,
        port: user.emailSettings.imapPort,
        tls: user.emailSettings.imapPort === 993,
      });

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          // Buscar e-mails não lidos
          const searchCriteria = ['UNSEEN'];
          const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM SUBJECT)', 'TEXT'],
            markSeen: true,
          };

          imap.search(searchCriteria, (err, results) => {
            if (err) {
              imap.end();
              return reject(err);
            }

            if (!results.length) {
              imap.end();
              return resolve(true);
            }

            const processedEmails: Promise<void>[] = [];

            const messageStream = imap.fetch(results, fetchOptions);

            messageStream.on('message', (msg) => {
              const emailPromise = this.processMessage(msg, user);
              processedEmails.push(emailPromise);
            });

            messageStream.once('error', (err) => {
              imap.end();
              reject(err);
            });

            messageStream.once('end', () => {
              Promise.all(processedEmails)
                .then(() => {
                  imap.end();
                  resolve(true);
                })
                .catch((err) => {
                  imap.end();
                  reject(err);
                });
            });
          });
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    });
  }

  private async processMessage(msg: any, user: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const email: Partial<EmailMessage> = {};

      msg.on('body', (stream: any, info: any) => {
        if (info.which === 'TEXT') {
          simpleParser(stream, async (err, parsed) => {
            if (err) return;
            email.body = parsed.text || null;
          });
        } else {
          let buffer = '';
          stream.on('data', (chunk: any) => {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', () => {
            const header = Imap.parseHeader(buffer);
            email.fromEmail = Array.isArray(header.from)
              ? header.from[0]
              : header.from;
            email.subject = Array.isArray(header.subject)
              ? header.subject[0]
              : header.subject;
          });
        }
      });

      msg.once('end', async () => {
        try {
          // Verificar regras
          for (const rule of user.emailRules) {
            if (this.matchesRule(email as EmailMessage, rule)) {
              await this.applyRule(email as EmailMessage, rule, user);
            }
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private matchesRule(email: EmailMessage, rule: any): boolean {
    if (rule.fromEmail && !email.fromEmail?.includes(rule.fromEmail)) {
      return false;
    }

    if (
      rule.subject &&
      (!email.subject ||
        !email.subject.toLowerCase().includes(rule.subject.toLowerCase()))
    ) {
      return false;
    }

    if (
      rule.body &&
      (!email.body ||
        !email.body.toLowerCase().includes(rule.body.toLowerCase()))
    ) {
      return false;
    }

    return true;
  }

  private async applyRule(email: EmailMessage, rule: any, user: any) {
    try {
      // Criar log
      await prisma.emailLog.create({
        data: {
          fromEmail: email.fromEmail,
          subject: email.subject,
          body: email.body,
          status: 'processing',
          userId: user.id,
          emailRuleId: rule.id,
        },
      });

      // Enviar resposta automática
      const transporter = createTransport({
        host: user.emailSettings.smtpHost,
        port: user.emailSettings.smtpPort,
        secure: user.emailSettings.smtpPort === 465,
        auth: {
          user: user.emailSettings.smtpUser,
          pass: user.emailSettings.smtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"${user.emailSettings.fromName}" <${user.emailSettings.fromEmail}>`,
        to: email.fromEmail,
        subject: `Re: ${email.subject}`,
        text: rule.response,
      });

      // Atualizar log
      await prisma.emailLog.update({
        where: {
          id: rule.id,
        },
        data: {
          status: 'completed',
        },
      });
    } catch (error) {
      // Registrar erro no log
      await prisma.emailLog.update({
        where: {
          id: rule.id,
        },
        data: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }
}

export const emailMonitorService = new EmailMonitorService(); 