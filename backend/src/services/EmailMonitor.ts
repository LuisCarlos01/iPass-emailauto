import { PrismaClient } from '@prisma/client';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { promisify } from 'util';

class EmailMonitor {
  private imap: Imap;
  private prisma: PrismaClient;
  private transporter: nodemailer.Transporter;
  private isMonitoring: boolean = false;

  constructor(private emailSettings: {
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
    userId: string;
  }) {
    this.prisma = new PrismaClient();
    this.setupImap();
    this.setupSmtp();
  }

  private setupImap() {
    this.imap = new Imap({
      user: this.emailSettings.imapUser,
      password: this.emailSettings.imapPassword,
      host: this.emailSettings.imapHost,
      port: this.emailSettings.imapPort,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    this.imap.on('error', (err) => {
      console.error('IMAP Error:', err);
      this.logError('IMAP connection error', err);
    });
  }

  private setupSmtp() {
    this.transporter = nodemailer.createTransport({
      host: this.emailSettings.smtpHost,
      port: this.emailSettings.smtpPort,
      secure: this.emailSettings.smtpPort === 465,
      auth: {
        user: this.emailSettings.smtpUser,
        pass: this.emailSettings.smtpPassword
      }
    });
  }

  private async logError(message: string, error: Error) {
    try {
      await this.prisma.emailLog.create({
        data: {
          status: 'ERROR',
          error: `${message}: ${error.message}`,
          fromEmail: 'system',
          userId: this.emailSettings.userId
        }
      });
    } catch (err) {
      console.error('Error logging to database:', err);
    }
  }

  public async startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    
    try {
      await this.connectImap();
      this.setupMailboxListener();
    } catch (error) {
      this.isMonitoring = false;
      await this.logError('Failed to start monitoring', error as Error);
      throw error;
    }
  }

  private async connectImap(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });

      this.imap.once('error', (err) => {
        reject(err);
      });

      this.imap.connect();
    });
  }

  private setupMailboxListener() {
    this.imap.on('mail', async () => {
      try {
        await this.processNewEmails();
      } catch (error) {
        await this.logError('Error processing new emails', error as Error);
      }
    });
  }

  private async processNewEmails() {
    const messages = await this.fetchUnseenMessages();
    
    for (const message of messages) {
      try {
        const email = await simpleParser(message);
        await this.handleEmail(email);
      } catch (error) {
        await this.logError('Error processing email', error as Error);
      }
    }
  }

  private async fetchUnseenMessages(): Promise<Buffer[]> {
    return new Promise((resolve, reject) => {
      this.imap.search(['UNSEEN'], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (!results.length) {
          resolve([]);
          return;
        }

        const fetch = this.imap.fetch(results, { bodies: '' });
        const messages: Buffer[] = [];

        fetch.on('message', (msg) => {
          msg.on('body', (stream) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.once('end', () => messages.push(Buffer.concat(chunks)));
          });
        });

        fetch.once('error', reject);
        fetch.once('end', () => resolve(messages));
      });
    });
  }

  private async handleEmail(email: any) {
    const fromEmail = email.from?.value[0]?.address;
    if (!fromEmail) return;

    const rules = await this.prisma.emailRule.findMany({
      where: {
        userId: this.emailSettings.userId,
        isActive: true,
        fromEmail: fromEmail
      }
    });

    for (const rule of rules) {
      if (this.emailMatchesRule(email, rule)) {
        await this.sendResponse(email, rule);
        await this.logEmailProcessed(email, rule);
      }
    }
  }

  private emailMatchesRule(email: any, rule: any): boolean {
    if (rule.subject && !email.subject?.includes(rule.subject)) {
      return false;
    }

    if (rule.body && !email.text?.includes(rule.body)) {
      return false;
    }

    return true;
  }

  private async sendResponse(email: any, rule: any) {
    const mailOptions = {
      from: `"${this.emailSettings.fromName}" <${this.emailSettings.fromEmail}>`,
      to: email.from.value[0].address,
      subject: `Re: ${email.subject}`,
      text: rule.response,
      references: [email.messageId],
      inReplyTo: email.messageId
    };

    await this.transporter.sendMail(mailOptions);
  }

  private async logEmailProcessed(email: any, rule: any) {
    await this.prisma.emailLog.create({
      data: {
        fromEmail: email.from.value[0].address,
        subject: email.subject,
        body: email.text,
        status: 'PROCESSED',
        userId: this.emailSettings.userId,
        emailRuleId: rule.id
      }
    });
  }

  public async stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    this.imap.end();
  }
}

export default EmailMonitor; 