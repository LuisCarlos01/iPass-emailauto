import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';

export const dashboardController = {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    const [
      totalRules,
      activeRules,
      totalEmailsProcessed,
      totalEmailsResponded,
    ] = await Promise.all([
      prisma.emailRule.count({
        where: {
          userId,
        },
      }),
      prisma.emailRule.count({
        where: {
          userId,
          isActive: true,
        },
      }),
      prisma.emailLog.count({
        where: {
          userId,
        },
      }),
      prisma.emailLog.count({
        where: {
          userId,
          status: 'completed',
        },
      }),
    ]);

    const successRate =
      totalEmailsProcessed > 0
        ? Math.round((totalEmailsResponded / totalEmailsProcessed) * 100)
        : 0;

    return reply.send({
      totalRules,
      activeRules,
      totalEmailsProcessed,
      totalEmailsResponded,
      successRate,
    });
  },
}; 