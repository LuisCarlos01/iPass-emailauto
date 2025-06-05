import { Router } from 'express';
import { prisma } from '../database/prismaClient';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { subDays, format } from 'date-fns';

const dashboardRoutes = Router();

dashboardRoutes.use(ensureAuthenticated);

dashboardRoutes.get('/metrics', async (request, response) => {
  try {
    // Busca total de regras e regras ativas
    const [totalRules, activeRules] = await Promise.all([
      prisma.emailRule.count(),
      prisma.emailRule.count({
        where: {
          isActive: true
        }
      })
    ]);

    // Busca total de emails e status de processamento
    const [totalEmails, processedEmails, errorEmails] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({
        where: {
          status: 'SUCCESS'
        }
      }),
      prisma.emailLog.count({
        where: {
          status: 'ERROR'
        }
      })
    ]);

    // Busca emails por dia (últimos 7 dias)
    const sevenDaysAgo = subDays(new Date(), 7);
    const emailsByDay = await prisma.emailLog.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Formata os dados de emails por dia
    const formattedEmailsByDay = emailsByDay.map(day => ({
      date: format(day.createdAt, 'dd/MM'),
      count: day._count.id
    }));

    // Busca distribuição de regras por tipo
    const ruleTypes = await prisma.emailRule.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    const ruleDistribution = ruleTypes.map(type => ({
      name: type.type,
      value: type._count.id
    }));

    // Verifica status do monitoramento
    const lastLog = await prisma.emailLog.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    let monitoringStatus = 'INACTIVE';
    if (lastLog) {
      const lastLogTime = new Date(lastLog.createdAt).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastLogTime) / (1000 * 60);

      if (diffMinutes <= 5) {
        monitoringStatus = lastLog.status === 'ERROR' ? 'ERROR' : 'ACTIVE';
      }
    }

    return response.json({
      totalRules,
      activeRules,
      totalEmails,
      processedEmails,
      errorEmails,
      monitoringStatus,
      emailsByDay: formattedEmailsByDay,
      ruleDistribution
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return response.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { dashboardRoutes }; 