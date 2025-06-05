import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import EmailMonitor from '../services/EmailMonitor';

const prisma = new PrismaClient();
const monitors = new Map<string, EmailMonitor>();

export async function startMonitoring(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).id;

    // Verifica se já existe um monitor para este usuário
    if (monitors.has(userId)) {
      return reply.status(400).send({ error: 'Monitoramento já está ativo para este usuário' });
    }

    // Busca as configurações de e-mail do usuário
    const emailSettings = await prisma.emailSettings.findUnique({
      where: { userId }
    });

    if (!emailSettings) {
      return reply.status(400).send({ error: 'Configurações de e-mail não encontradas' });
    }

    // Cria e inicia o monitor
    const monitor = new EmailMonitor(emailSettings);
    await monitor.startMonitoring();
    
    // Armazena o monitor na memória
    monitors.set(userId, monitor);

    return reply.send({ message: 'Monitoramento iniciado com sucesso' });
  } catch (error) {
    console.error('Erro ao iniciar monitoramento:', error);
    return reply.status(500).send({ error: 'Erro ao iniciar monitoramento' });
  }
}

export async function stopMonitoring(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).id;

    // Verifica se existe um monitor para este usuário
    const monitor = monitors.get(userId);
    if (!monitor) {
      return reply.status(400).send({ error: 'Nenhum monitoramento ativo para este usuário' });
    }

    // Para o monitor e remove da memória
    await monitor.stopMonitoring();
    monitors.delete(userId);

    return reply.send({ message: 'Monitoramento parado com sucesso' });
  } catch (error) {
    console.error('Erro ao parar monitoramento:', error);
    return reply.status(500).send({ error: 'Erro ao parar monitoramento' });
  }
}

export async function getMonitoringStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).id;
    const isActive = monitors.has(userId);

    // Busca os logs recentes
    const recentLogs = await prisma.emailLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        emailRule: {
          select: {
            name: true,
            fromEmail: true
          }
        }
      }
    });

    return reply.send({
      isActive,
      recentLogs
    });
  } catch (error) {
    console.error('Erro ao buscar status do monitoramento:', error);
    return reply.status(500).send({ error: 'Erro ao buscar status do monitoramento' });
  }
} 