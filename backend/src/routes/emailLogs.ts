import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth } from '../middlewares/auth';
import { createObjectCsvStringifier } from 'csv-writer';

const router = Router();

const listFiltersSchema = z.object({
  status: z.string().optional(),
  fromEmail: z.string().email().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

router.use(auth);

router.get('/', async (req, res) => {
  const filters = listFiltersSchema.parse(req.query);
  const where = {
    userId: req.user.id,
    ...(filters.status && { status: filters.status }),
    ...(filters.fromEmail && { fromEmail: filters.fromEmail }),
    ...(filters.startDate && {
      createdAt: {
        gte: new Date(filters.startDate),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      },
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      include: {
        rule: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.emailLog.count({ where }),
  ]);

  res.json({
    logs,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  });
});

router.get('/export', async (req, res) => {
  const filters = listFiltersSchema.parse(req.query);
  const where = {
    userId: req.user.id,
    ...(filters.status && { status: filters.status }),
    ...(filters.fromEmail && { fromEmail: filters.fromEmail }),
    ...(filters.startDate && {
      createdAt: {
        gte: new Date(filters.startDate),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      },
    }),
  };

  const logs = await prisma.emailLog.findMany({
    where,
    include: {
      rule: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'createdAt', title: 'Data' },
      { id: 'fromEmail', title: 'Remetente' },
      { id: 'subject', title: 'Assunto' },
      { id: 'content', title: 'Conteúdo' },
      { id: 'response', title: 'Resposta' },
      { id: 'status', title: 'Status' },
      { id: 'ruleName', title: 'Regra' },
    ],
  });

  const records = logs.map((log) => ({
    createdAt: new Date(log.createdAt).toLocaleString('pt-BR'),
    fromEmail: log.fromEmail,
    subject: log.subject,
    content: log.content,
    response: log.response,
    status: log.status,
    ruleName: log.rule?.name || '-',
  }));

  const csvContent =
    csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=email-logs.csv'
  );
  res.send(csvContent);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const log = await prisma.emailLog.findUnique({
    where: { id },
    include: {
      rule: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!log) {
    return res.status(404).json({ message: 'Log não encontrado' });
  }

  if (log.userId !== req.user.id) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  res.json(log);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const log = await prisma.emailLog.findUnique({
    where: { id },
  });

  if (!log) {
    return res.status(404).json({ message: 'Log não encontrado' });
  }

  if (log.userId !== req.user.id) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  await prisma.emailLog.delete({
    where: { id },
  });

  res.status(204).send();
});

export { router as emailLogsRouter }; 