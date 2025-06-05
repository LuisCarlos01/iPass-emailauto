import { EmailLog } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { sendEmail } from './emailSender';

export async function processEmail(emailLog: EmailLog) {
  try {
    logger.info(`Processing email: ${emailLog.id}`);

    const rules = await prisma.emailRule.findMany({
      where: {
        active: true,
      },
    });

    for (const rule of rules) {
      const conditions = rule.conditions as {
        field: 'subject' | 'fromEmail' | 'content';
        operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
        value: string;
      }[];

      const matches = conditions.every((condition) => {
        const field = emailLog[condition.field];
        const value = condition.value.toLowerCase();

        switch (condition.operator) {
          case 'contains':
            return field.toLowerCase().includes(value);
          case 'equals':
            return field.toLowerCase() === value;
          case 'startsWith':
            return field.toLowerCase().startsWith(value);
          case 'endsWith':
            return field.toLowerCase().endsWith(value);
          default:
            return false;
        }
      });

      if (matches) {
        logger.info(`Email matches rule: ${rule.id}`);

        await sendEmail({
          to: emailLog.fromEmail,
          subject: `Re: ${emailLog.subject}`,
          text: rule.response,
        });

        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            ruleId: rule.id,
            status: 'processed',
            sentResponse: true,
            response: rule.response,
            respondedAt: new Date(),
          },
        });

        return;
      }
    }

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'no_rule_match',
      },
    });

    logger.info(`No matching rules found for email: ${emailLog.id}`);
  } catch (error) {
    logger.error('Error processing email:', error);

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'error',
      },
    });

    throw error;
  }
} 