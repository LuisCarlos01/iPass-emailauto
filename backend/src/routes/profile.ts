import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import { prisma } from '../lib/prisma';
import { hash, compare } from 'bcryptjs';
import { testEmailConnection } from '../lib/email';

export async function profileRoutes(app: FastifyInstance) {
  app.get(
    '/profile',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const user = await prisma.user.findUnique({
        where: {
          id: request.user.sub,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailSettings: {
            select: {
              imapHost: true,
              imapPort: true,
              imapUser: true,
              imapPassword: true,
              smtpHost: true,
              smtpPort: true,
              smtpUser: true,
              smtpPassword: true,
              fromName: true,
              fromEmail: true,
            },
          },
        },
      });

      return user;
    },
  );

  app.put(
    '/profile',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const updateProfileSchema = z.object({
        name: z.string().min(1),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
      });

      const { name, currentPassword, newPassword } = updateProfileSchema.parse(
        request.body,
      );

      const user = await prisma.user.findUnique({
        where: {
          id: request.user.sub,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (newPassword) {
        if (!currentPassword) {
          throw new Error('Current password is required');
        }

        const isValidPassword = await compare(currentPassword, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid current password');
        }

        const hashedPassword = await hash(newPassword, 8);

        await prisma.user.update({
          where: {
            id: request.user.sub,
          },
          data: {
            name,
            password: hashedPassword,
          },
        });
      } else {
        await prisma.user.update({
          where: {
            id: request.user.sub,
          },
          data: {
            name,
          },
        });
      }

      return { message: 'Profile updated successfully' };
    },
  );

  app.put(
    '/profile/email-settings',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const updateEmailSettingsSchema = z.object({
        imapHost: z.string().min(1),
        imapPort: z.number().min(1).max(65535),
        imapUser: z.string().min(1),
        imapPassword: z.string().optional(),
        smtpHost: z.string().min(1),
        smtpPort: z.number().min(1).max(65535),
        smtpUser: z.string().min(1),
        smtpPassword: z.string().optional(),
        fromName: z.string().min(1),
        fromEmail: z.string().email(),
      });

      const emailSettings = updateEmailSettingsSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: {
          id: request.user.sub,
        },
        include: {
          emailSettings: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const data = {
        ...emailSettings,
      };

      // Manter as senhas atuais se não forem fornecidas novas
      if (!data.imapPassword) {
        delete data.imapPassword;
      }
      if (!data.smtpPassword) {
        delete data.smtpPassword;
      }

      if (user.emailSettings) {
        await prisma.emailSettings.update({
          where: {
            userId: request.user.sub,
          },
          data,
        });
      } else {
        await prisma.emailSettings.create({
          data: {
            ...data,
            userId: request.user.sub,
          },
        });
      }

      return { message: 'Email settings updated successfully' };
    },
  );

  app.post(
    '/profile/test-email-settings',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const user = await prisma.user.findUnique({
        where: {
          id: request.user.sub,
        },
        include: {
          emailSettings: true,
        },
      });

      if (!user?.emailSettings) {
        throw new Error('Email settings not found');
      }

      await testEmailConnection(user.emailSettings);

      return { message: 'Email settings tested successfully' };
    },
  );
} 