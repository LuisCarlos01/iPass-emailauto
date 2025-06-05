import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { logger } from '../utils/logger';
import { processEmail } from './emailProcessor';
import { prisma } from '../lib/prisma';
import { config } from '../config';

class EmailWatcher {
  private imap: Imap;
  private isRunning: boolean = false;

  constructor() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER as string,
      password: process.env.EMAIL_PASSWORD as string,
      host: process.env.EMAIL_HOST as string,
      port: Number(process.env.EMAIL_PORT),
      tls: process.env.EMAIL_TLS === 'true',
    });

    this.imap.once('error', (err) => {
      logger.error('IMAP connection error:', err);
    });
  }

  public async start() {
    if (this.isRunning) {
      logger.warn('Email watcher is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting email watcher...');

    try {
      await this.connect();
      await this.watchInbox();
    } catch (error) {
      logger.error('Failed to start email watcher:', error);
      this.isRunning = false;
    }
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        logger.info('IMAP connection established');
        resolve();
      });

      this.imap.once('error', (err) => {
        logger.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  private async watchInbox() {
    try {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          logger.error('Error opening inbox:', err);
          return;
        }

        logger.info('Watching inbox for new emails...');

        this.imap.on('mail', async () => {
          await this.processNewEmails();
        });
      });
    } catch (error) {
      logger.error('Error watching inbox:', error);
    }
  }

  private async processNewEmails() {
    try {
      const messages = await this.fetchNewEmails();

      for (const message of messages) {
        const email = await simpleParser(message);
        
        const emailLog = await prisma.emailLog.create({
          data: {
            fromEmail: email.from?.text || '',
            toEmail: email.to?.text || '',
            subject: email.subject || '',
            content: email.text || '',
            status: 'received',
          },
        });

        await processEmail(emailLog);
      }
    } catch (error) {
      logger.error('Error processing new emails:', error);
    }
  }

  private fetchNewEmails(): Promise<Buffer[]> {
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
            stream.on('data', (chunk) => {
              chunks.push(chunk);
            });
            stream.once('end', () => {
              messages.push(Buffer.concat(chunks));
            });
          });
        });

        fetch.once('error', (err) => {
          reject(err);
        });

        fetch.once('end', () => {
          resolve(messages);
        });
      });
    });
  }

  async stop() {
    if (!this.isRunning) {
      logger.warn('Email watcher is not running');
      return;
    }

    this.isRunning = false;
    logger.info('Email watcher stopped');
  }

  isWatching() {
    return this.isRunning;
  }
}

export const emailWatcher = new EmailWatcher(); 