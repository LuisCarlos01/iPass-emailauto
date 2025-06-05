import { EmailSettings } from '@prisma/client';
import { createTransport } from 'nodemailer';
import * as Imap from 'imap';

export async function testEmailConnection(settings: EmailSettings) {
  // Testar conexão SMTP
  const smtpTransport = createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  });

  await smtpTransport.verify();

  // Testar conexão IMAP
  const imap = new Imap({
    user: settings.imapUser,
    password: settings.imapPassword,
    host: settings.imapHost,
    port: settings.imapPort,
    tls: settings.imapPort === 993,
  });

  return new Promise((resolve, reject) => {
    imap.once('ready', () => {
      imap.end();
      resolve(true);
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.connect();
  });
} 