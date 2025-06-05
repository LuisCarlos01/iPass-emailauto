import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { createEmailRuleSchema, updateEmailRuleSchema } from '../schemas/emailRule';

export const emailRulesController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    const emailRules = await prisma.emailRule.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reply.send(emailRules);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;
    const data = createEmailRuleSchema.parse(request.body);

    const emailRule = await prisma.emailRule.create({
      data: {
        ...data,
        userId,
      },
    });

    return reply.status(201).send(emailRule);
  },

  async update(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    const userId = request.user.sub;
    const { id } = request.params;
    const data = updateEmailRuleSchema.parse(request.body);

    const emailRule = await prisma.emailRule.findUnique({
      where: {
        id,
      },
    });

    if (!emailRule) {
      return reply.status(404).send({ message: 'Regra não encontrada' });
    }

    if (emailRule.userId !== userId) {
      return reply.status(403).send({ message: 'Não autorizado' });
    }

    const updatedEmailRule = await prisma.emailRule.update({
      where: {
        id,
      },
      data,
    });

    return reply.send(updatedEmailRule);
  },

  async delete(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    const userId = request.user.sub;
    const { id } = request.params;

    const emailRule = await prisma.emailRule.findUnique({
      where: {
        id,
      },
    });

    if (!emailRule) {
      return reply.status(404).send({ message: 'Regra não encontrada' });
    }

    if (emailRule.userId !== userId) {
      return reply.status(403).send({ message: 'Não autorizado' });
    }

    await prisma.emailRule.delete({
      where: {
        id,
      },
    });

    return reply.status(204).send();
  },

  async toggleActive(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    const userId = request.user.sub;
    const { id } = request.params;

    const emailRule = await prisma.emailRule.findUnique({
      where: {
        id,
      },
    });

    if (!emailRule) {
      return reply.status(404).send({ message: 'Regra não encontrada' });
    }

    if (emailRule.userId !== userId) {
      return reply.status(403).send({ message: 'Não autorizado' });
    }

    const updatedEmailRule = await prisma.emailRule.update({
      where: {
        id,
      },
      data: {
        isActive: !emailRule.isActive,
      },
    });

    return reply.send(updatedEmailRule);
  },
}; 